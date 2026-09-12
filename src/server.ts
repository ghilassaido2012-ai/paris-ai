import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

import {
  handleChat,
  handleGenerateImage,
  handleEditImage,
  handleGenerateVideo,
  handleVideoStatus,
  handleVideoDownloadUri,
  handleAnalyzeDocument,
  handleTextToSpeech,
} from "./server/gemini";

async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return null;

  try {
    if (url.pathname === "/api/health") {
      return new Response(JSON.stringify({ status: "ok", service: "Paris AI Core API" }), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      const body = await request.json();
      const result = await handleChat(body);
      return new Response(JSON.stringify(result), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/api/image/generate" && request.method === "POST") {
      const body = await request.json();
      const result = await handleGenerateImage(body);
      return new Response(JSON.stringify(result), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/api/image/edit" && request.method === "POST") {
      const body = await request.json();
      const result = await handleEditImage(body);
      return new Response(JSON.stringify(result), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/api/video/generate" && request.method === "POST") {
      const body = await request.json();
      const result = await handleGenerateVideo(body);
      return new Response(JSON.stringify(result), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/api/video/status" && request.method === "POST") {
      const body = await request.json();
      const result = await handleVideoStatus(body);
      return new Response(JSON.stringify(result), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/api/video/download" && request.method === "POST") {
      const body = await request.json();
      const { buffer, contentType } = await handleVideoDownloadUri(body);
      return new Response(buffer, {
        headers: {
          "content-type": contentType,
          "content-disposition": `attachment; filename="paris-ai-veo-${Date.now()}.mp4"`,
        },
      });
    }

    if (url.pathname === "/api/video/stream" && request.method === "GET") {
      const op = url.searchParams.get("op") || "";
      const { buffer, contentType } = await handleVideoDownloadUri({
        operationName: op,
      });
      return new Response(buffer, {
        headers: { "content-type": contentType },
      });
    }

    if (url.pathname === "/api/analyze" && request.method === "POST") {
      const body = await request.json();
      const result = await handleAnalyzeDocument(body);
      return new Response(JSON.stringify(result), {
        headers: { "content-type": "application/json" },
      });
    }

    if (url.pathname === "/api/tts" && request.method === "POST") {
      const body = await request.json();
      const result = await handleTextToSpeech(body);
      return new Response(JSON.stringify(result), {
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Route API non trouvée" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("API handler error:", msg);
    return new Response(JSON.stringify({ error: msg || "Erreur serveur interne" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const apiResponse = await handleApiRequest(request);
      if (apiResponse) return apiResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
