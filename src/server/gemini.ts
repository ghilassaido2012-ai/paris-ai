import { GoogleGenAI, Modality, GenerateVideosOperation } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

export type ChatMessage = {
  role: "user" | "model" | "assistant";
  content: string;
};

export async function handleChat({
  messages,
  model = "gemini-3.5-flash",
  systemInstruction,
  useSearch = false,
}: {
  messages: ChatMessage[];
  model?: string;
  systemInstruction?: string;
  useSearch?: boolean;
}) {
  const ai = getGeminiClient();

  const validModel = [
    "gemini-3.5-flash",
    "gemini-3.1-pro-preview",
    "gemini-3.1-flash-lite",
  ].includes(model)
    ? model
    : "gemini-3.5-flash";

  const contents = messages.map((m) => ({
    role: m.role === "model" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const config: Record<string, unknown> = {};

  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }

  let response;
  let usedSearchSuccess = false;

  if (useSearch) {
    try {
      config.tools = [{ googleSearch: {} }];
      response = await ai.models.generateContent({
        model: validModel,
        contents,
        config,
      });
      usedSearchSuccess = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("Search grounding failed, falling back to standard generation:", msg);
      delete config.tools;
      response = await ai.models.generateContent({
        model: validModel,
        contents,
        config,
      });
    }
  } else {
    response = await ai.models.generateContent({
      model: validModel,
      contents,
      config,
    });
  }

  const text = response.text ?? "";
  const candidate = response.candidates?.[0];
  const metadata = candidate?.groundingMetadata;
  const rawChunks = metadata?.groundingChunks;

  const groundingChunks = Array.isArray(rawChunks)
    ? rawChunks.map((c: Record<string, unknown>) => {
        const web = c.web as Record<string, string> | undefined;
        const maps = c.maps as Record<string, string> | undefined;
        return {
          uri: web?.uri || maps?.uri || "",
          title: web?.title || maps?.title || "Source web",
        };
      })
    : [];

  return {
    text,
    model: validModel,
    groundingChunks,
    groundingActive: usedSearchSuccess,
  };
}

export async function handleGenerateImage({
  prompt,
  aspectRatio = "1:1",
}: {
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
}) {
  const ai = getGeminiClient();

  const validRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
  const ratio = validRatios.includes(aspectRatio) ? aspectRatio : "1:1";

  const modelsToTry = [
    "gemini-3.1-flash-image-preview",
    "gemini-3.1-flash-image",
    "gemini-3.1-flash-lite-image",
  ];

  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: ratio as "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          return {
            imageUrl: `data:${mime};base64,${part.inlineData.data}`,
            model,
          };
        }
      }

      if (response.text) {
        return {
          text: response.text,
          model,
        };
      }
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Model ${model} failed, trying next:`, msg);
    }
  }

  throw lastError || new Error("Échec de génération d'image.");
}

export async function handleEditImage({
  prompt,
  imageData,
  mimeType = "image/png",
}: {
  prompt: string;
  imageData: string;
  mimeType?: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
}) {
  const ai = getGeminiClient();

  const rawBase64 = imageData.includes("base64,") ? imageData.split("base64,")[1] || "" : imageData;

  const modelsToTry = [
    "gemini-3.1-flash-image-preview",
    "gemini-3.1-flash-image",
    "gemini-3.1-flash-lite-image",
  ];

  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                data: rawBase64,
                mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          return {
            imageUrl: `data:${mime};base64,${part.inlineData.data}`,
            model,
          };
        }
      }
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Image edit with ${model} failed:`, msg);
    }
  }

  throw lastError || new Error("Échec de modification d'image.");
}

export async function handleGenerateVideo({
  prompt,
  imageData,
  aspectRatio = "16:9",
}: {
  prompt?: string;
  imageData?: string;
  aspectRatio?: "16:9" | "9:16";
}) {
  const ai = getGeminiClient();

  const ratio = aspectRatio === "9:16" ? "9:16" : "16:9";
  const modelsToTry = ["veo-3.1-fast-generate-preview", "veo-3.1-lite-generate-preview"];

  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const imagePayload = imageData
        ? {
            imageBytes: imageData.includes("base64,")
              ? imageData.split("base64,")[1] || ""
              : imageData,
            mimeType: "image/png",
          }
        : undefined;

      const operation = await ai.models.generateVideos({
        model,
        prompt,
        image: imagePayload,
        config: {
          numberOfVideos: 1,
          resolution: "720p",
          aspectRatio: ratio,
        },
      });
      return {
        operationName: operation.name,
        model,
      };
    } catch (err: unknown) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Veo model ${model} failed:`, msg);
    }
  }

  throw lastError || new Error("Échec du démarrage de la génération vidéo Veo.");
}

export async function handleVideoStatus({ operationName }: { operationName: string }) {
  const ai = getGeminiClient();

  const op = new GenerateVideosOperation();
  op.name = operationName;
  const updated = await ai.operations.getVideosOperation({ operation: op });

  const record = updated as unknown as { error?: { message?: string } };

  return {
    done: updated.done ?? false,
    error: record.error?.message,
    hasVideo: Boolean(updated.response?.generatedVideos?.[0]?.video?.uri),
  };
}

export async function handleVideoDownloadUri({ operationName }: { operationName: string }) {
  const ai = getGeminiClient();

  const op = new GenerateVideosOperation();
  op.name = operationName;
  const updated = await ai.operations.getVideosOperation({ operation: op });

  const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
  if (!uri) {
    throw new Error("Vidéo non disponible ou génération encore en cours.");
  }

  const apiKey = process.env.GEMINI_API_KEY || "";
  const videoRes = await fetch(uri, {
    headers: { "x-goog-api-key": apiKey },
  });

  if (!videoRes.ok) {
    throw new Error(`Erreur lors du téléchargement de la vidéo: ${videoRes.statusText}`);
  }

  const arrayBuffer = await videoRes.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: videoRes.headers.get("content-type") || "video/mp4",
  };
}

export async function handleAnalyzeDocument({
  prompt,
  fileData,
  mimeType = "application/pdf",
}: {
  prompt: string;
  fileData: string;
  mimeType?: string;
}) {
  const ai = getGeminiClient();

  const rawBase64 = fileData.includes("base64,") ? fileData.split("base64,")[1] || "" : fileData;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: {
      parts: [
        {
          inlineData: {
            data: rawBase64,
            mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      systemInstruction:
        "Tu es un analyste expert de documents pour Paris AI. Fournis une analyse détaillée, structurée avec des titres, des points clés et des recommandations claires en français.",
    },
  });

  return {
    analysis: response.text ?? "",
    model: "gemini-3.5-flash",
  };
}

export async function handleTextToSpeech({
  text,
  voiceName = "Zephyr",
}: {
  text: string;
  voiceName?: "Puck" | "Charon" | "Kore" | "Fenrir" | "Zephyr";
}) {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: text.slice(0, 500) }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  return {
    audioData: base64Audio,
  };
}
