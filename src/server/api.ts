import express from "express";
import type { Request, Response, Express } from "express";
import { WebSocketServer } from "ws";
import type { Server as HttpServer } from "node:http";
import { GoogleGenAI, Modality, type LiveServerMessage } from "@google/genai";
import {
  handleChat,
  handleGenerateImage,
  handleEditImage,
  handleGenerateVideo,
  handleVideoStatus,
  handleVideoDownloadUri,
  handleAnalyzeDocument,
  handleTextToSpeech,
} from "./gemini";

export function createApiApp(): Express {
  const app = express();
  app.use(express.json({ limit: "50mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "Paris AI Core API",
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { messages, model, systemInstruction, useSearch } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Le paramètre 'messages' est requis." });
        return;
      }
      const result = await handleChat({
        messages,
        model,
        systemInstruction,
        useSearch: Boolean(useSearch),
      });
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Chat error:", msg);
      res.status(500).json({
        error: msg || "Erreur lors de la conversation avec Paris AI.",
      });
    }
  });

  app.post("/api/image/generate", async (req: Request, res: Response) => {
    try {
      const { prompt, aspectRatio } = req.body;
      if (!prompt || typeof prompt !== "string") {
        res.status(400).json({ error: "Le prompt est requis." });
        return;
      }
      const result = await handleGenerateImage({ prompt, aspectRatio });
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Image generation error:", msg);
      res.status(500).json({
        error: msg || "Erreur lors de la création de l'image.",
      });
    }
  });

  app.post("/api/image/edit", async (req: Request, res: Response) => {
    try {
      const { prompt, imageData, mimeType, aspectRatio } = req.body;
      if (!prompt || !imageData) {
        res.status(400).json({ error: "Le prompt et l'image d'origine sont requis." });
        return;
      }
      const result = await handleEditImage({
        prompt,
        imageData,
        mimeType,
        aspectRatio,
      });
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Image edit error:", msg);
      res.status(500).json({
        error: msg || "Erreur lors de la retouche de l'image.",
      });
    }
  });

  app.post("/api/video/generate", async (req: Request, res: Response) => {
    try {
      const { prompt, imageData, aspectRatio } = req.body;
      if (!prompt && !imageData) {
        res.status(400).json({
          error: "Un prompt textuel ou une image de départ est requis pour Veo.",
        });
        return;
      }
      const result = await handleGenerateVideo({
        prompt,
        imageData,
        aspectRatio,
      });
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Video generation error:", msg);
      res.status(500).json({
        error: msg || "Erreur lors de la génération vidéo avec Veo.",
      });
    }
  });

  app.post("/api/video/status", async (req: Request, res: Response) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        res.status(400).json({ error: "operationName requis." });
        return;
      }
      const status = await handleVideoStatus({ operationName });
      res.json(status);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Video status error:", msg);
      res.status(500).json({
        error: msg || "Erreur lors de la vérification de statut vidéo.",
      });
    }
  });

  app.post("/api/video/download", async (req: Request, res: Response) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        res.status(400).json({ error: "operationName requis." });
        return;
      }
      const { buffer, contentType } = await handleVideoDownloadUri({
        operationName,
      });
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="paris-ai-veo-${Date.now()}.mp4"`);
      res.send(buffer);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Video download error:", msg);
      res.status(500).json({
        error: msg || "Erreur lors du téléchargement de la vidéo.",
      });
    }
  });

  app.get("/api/video/stream", async (req: Request, res: Response) => {
    try {
      const operationName = req.query.op as string;
      if (!operationName) {
        res.status(400).send("operationName query param requis.");
        return;
      }
      const { buffer, contentType } = await handleVideoDownloadUri({
        operationName,
      });
      res.setHeader("Content-Type", contentType);
      res.send(buffer);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Video stream error:", msg);
      res.status(500).send(msg || "Erreur vidéo.");
    }
  });

  app.post("/api/analyze", async (req: Request, res: Response) => {
    try {
      const { prompt, fileData, mimeType } = req.body;
      if (!prompt || !fileData) {
        res.status(400).json({
          error: "Le prompt et le fichier (base64) sont requis pour l'analyse.",
        });
        return;
      }
      const result = await handleAnalyzeDocument({ prompt, fileData, mimeType });
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Analyze error:", msg);
      res.status(500).json({
        error: msg || "Erreur lors de l'analyse du document.",
      });
    }
  });

  app.post("/api/tts", async (req: Request, res: Response) => {
    try {
      const { text, voiceName } = req.body;
      if (!text) {
        res.status(400).json({ error: "Texte requis." });
        return;
      }
      const result = await handleTextToSpeech({ text, voiceName });
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("TTS error:", msg);
      res.status(500).json({
        error: msg || "Erreur lors de la synthèse vocale.",
      });
    }
  });

  return app;
}

export function setupLiveWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url || "", `http://${request.headers.host}`);
    if (url.pathname === "/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", async (clientWs) => {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      clientWs.send(
        JSON.stringify({
          error: "GEMINI_API_KEY n'est pas configurée sur le serveur.",
        }),
      );
      clientWs.close();
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction:
            "Tu es Paris, l'assistant vocal intelligent de Paris AI. Réponds en français de manière fluide, concise, claire et naturelle comme dans une vraie conversation orale.",
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts && parts.length > 0) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
                }
                if (part.text) {
                  clientWs.send(JSON.stringify({ text: part.text }));
                }
              }
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onerror: (err) => {
            console.error("Live session callback error:", err);
            try {
              clientWs.send(
                JSON.stringify({
                  error: err?.message || "Erreur flux vocal en direct",
                }),
              );
            } catch (ignored) {
              void ignored;
            }
          },
          onclose: () => {
            try {
              clientWs.close();
            } catch (ignored) {
              void ignored;
            }
          },
        },
      });

      clientWs.on("message", (data) => {
        try {
          const payload = JSON.parse(data.toString());
          if (payload.audio) {
            session.sendRealtimeInput({
              audio: {
                data: payload.audio,
                mimeType: "audio/pcm;rate=16000",
              },
            });
          } else if (payload.text) {
            session.sendRealtimeInput({
              text: payload.text,
            });
          }
        } catch (e: unknown) {
          console.error("Failed to parse/forward audio input:", e);
        }
      });

      clientWs.on("close", () => {
        try {
          session.close();
        } catch (ignored) {
          void ignored;
        }
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Live connection initiation error:", msg);
      try {
        clientWs.send(
          JSON.stringify({
            error: msg || "Impossible d'établir la session vocale en direct.",
          }),
        );
        clientWs.close();
      } catch (ignored) {
        void ignored;
      }
    }
  });

  return wss;
}
