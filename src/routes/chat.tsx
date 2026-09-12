import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";
import { VoiceChatModal } from "@/components/VoiceChatModal";
import { useUserProfile } from "@/lib/user-store";
import {
  loadConversations,
  getActiveConversationId,
  setActiveConversationId,
  createNewConversation,
  updateConversation,
  type Conversation,
  type ChatItem,
} from "@/lib/chat-store";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Conversation — Paris AI" },
      {
        name: "description",
        content:
          "Discutez avec Paris AI : réponses enrichies, modèles Gemini 3.5 Flash, 3.1 Pro et Flash Lite, recherche Google en direct et conversation vocale.",
      },
      { property: "og:title", content: "Conversation — Paris AI" },
      {
        property: "og:description",
        content:
          "Interface conversationnelle intelligente avec recherche web et mode vocal en direct.",
      },
    ],
  }),
  component: ChatScreen,
});

const MODELS = [
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", tag: "Équilibré & Général" },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", tag: "Raisonnement Complexe" },
  { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", tag: "Ultra Rapide" },
];

const ROLES = [
  {
    id: "general",
    name: "Assistant Paris AI",
    instruction:
      "Tu es Paris AI, un assistant intelligent d'excellence bilingue français-anglais. Sois clair, concis, bien structuré avec des listes et du code si besoin.",
  },
  {
    id: "architect",
    name: "Architecte Logiciel",
    instruction:
      "Tu es un architecte logiciel senior expert en TypeScript, React, Cloud, Python et architectures distribuées. Fournis des solutions complètes, modernes, modulaires et sécurisées.",
  },
  {
    id: "creative",
    name: "Directeur Artistique",
    instruction:
      "Tu es un directeur artistique et stratège créatif renommé à Paris. Conseille sur le design, l'esthétique, les prompts d'images et la rédaction captivante.",
  },
  {
    id: "analyst",
    name: "Analyste Stratégique",
    instruction:
      "Tu es un consultant en stratégie et analyse de données. Synthétise les informations avec rigueur, points clés, métriques et plans d'action concrets.",
  },
];

export function ChatScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-3.5-flash");
  const [useSearch, setUseSearch] = useState(false);
  const [selectedRole, setSelectedRole] = useState(ROLES[0].id);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    data: string;
    mime: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useUserProfile();

  // Initialize or restore conversation
  useEffect(() => {
    const all = loadConversations();
    setConversations(all);

    const activeId = getActiveConversationId();
    let current = all.find((c) => c.id === activeId);

    if (!current) {
      current = createNewConversation(
        "Nouvelle conversation",
        selectedModel,
        useSearch,
        ROLES[0].instruction,
      );
      setConversations(loadConversations());
    }

    setActiveConv(current);
    setSelectedModel(current.model || "gemini-3.5-flash");
    setUseSearch(Boolean(current.useSearch));

    // Check if query param `q` was passed from home
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("q");
      if (query && query.trim()) {
        // Clear query from URL
        window.history.replaceState({}, "", "/chat");
        // Trigger send
        setTimeout(() => {
          handleSend(query, current);
        }, 150);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages, isLoading]);

  const handleSend = async (overrideText?: string, targetConv?: Conversation | null) => {
    const conv = targetConv || activeConv;
    const textToSend = (overrideText !== undefined ? overrideText : message).trim();
    if ((!textToSend && !attachedFile) || isLoading || !conv) return;

    setMessage("");
    setIsLoading(true);

    const userMessage: ChatItem = {
      id: `msg_${Date.now()}_user`,
      role: "user",
      content: attachedFile ? `${textToSend}\n\n[Fichier joint: ${attachedFile.name}]` : textToSend,
      timestamp: Date.now(),
    };

    const updatedMessages = [...conv.messages, userMessage];

    // Auto title if first user prompt
    let title = conv.title;
    if (conv.title === "Nouvelle conversation" && textToSend) {
      title = textToSend.slice(0, 36) + (textToSend.length > 36 ? "..." : "");
    }

    const updatedConv = updateConversation(conv.id, (c) => ({
      ...c,
      title,
      messages: updatedMessages,
      model: selectedModel,
      useSearch,
    }));

    if (updatedConv) {
      setActiveConv(updatedConv);
      setConversations(loadConversations());
    }

    const currentRole = ROLES.find((r) => r.id === selectedRole);

    try {
      let endpoint = "/api/chat";
      let requestBody: Record<string, unknown> = {
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        model: selectedModel,
        systemInstruction: currentRole?.instruction,
        useSearch,
      };

      // If there's an attached file and first prompt, use /api/analyze if PDF/Doc
      if (attachedFile) {
        endpoint = "/api/analyze";
        requestBody = {
          prompt: textToSend || "Analyse ce fichier en détail.",
          fileData: attachedFile.data,
          mimeType: attachedFile.mime,
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.text || data.analysis || "Réponse reçue.";

      const aiMessage: ChatItem = {
        id: `msg_${Date.now()}_model`,
        role: "model",
        content: replyText,
        timestamp: Date.now(),
        model: data.model || selectedModel,
        groundingChunks: data.groundingChunks || [],
        groundingActive: data.groundingActive,
      };

      const finalConv = updateConversation(conv.id, (c) => ({
        ...c,
        messages: [...c.messages, aiMessage],
      }));

      if (finalConv) {
        setActiveConv(finalConv);
        setConversations(loadConversations());
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Chat error:", msg);
      const errorMsg: ChatItem = {
        id: `msg_${Date.now()}_err`,
        role: "model",
        content: `⚠️ Une erreur s'est produite : ${msg || "Vérifiez votre connexion ou clé API."}`,
        timestamp: Date.now(),
      };
      updateConversation(conv.id, (c) => ({
        ...c,
        messages: [...c.messages, errorMsg],
      }));
      setActiveConv(loadConversations().find((c) => c.id === conv.id) || null);
    } finally {
      setIsLoading(false);
      setAttachedFile(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = async (text: string, id: string) => {
    if (playingId === id) {
      setPlayingId(null);
      return;
    }

    setPlayingId(id);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 600) }),
      });
      const data = await res.json();
      if (data.audioData) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioData}`);
        audio.onended = () => setPlayingId(null);
        audio.play();
      } else {
        setPlayingId(null);
      }
    } catch (err) {
      console.warn("TTS error:", err);
      setPlayingId(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAttachedFile({
        name: file.name,
        data: result,
        mime: file.type || "application/octet-stream",
      });
    };
    reader.readAsDataURL(file);
  };

  const startNewChat = () => {
    const newC = createNewConversation(
      "Nouvelle conversation",
      selectedModel,
      useSearch,
      ROLES.find((r) => r.id === selectedRole)?.instruction,
    );
    setConversations(loadConversations());
    setActiveConv(newC);
  };

  return (
    <AppShell className="h-screen flex flex-col overflow-hidden">
      {/* Voice live modal */}
      <VoiceChatModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />

      {/* Top Controls Toolbar */}
      <div className="z-20 border-b border-outline-variant/10 bg-surface-container-lowest/60 px-4 py-2 backdrop-blur-md">
        <div className="mx-auto flex max-w-[850px] flex-wrap items-center justify-between gap-2">
          {/* Model Selector */}
          <div className="flex items-center gap-1.5">
            <MaterialIcon name="psychology" className="text-primary text-[18px]" />
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                if (activeConv) {
                  updateConversation(activeConv.id, (c) => ({
                    ...c,
                    model: e.target.value,
                  }));
                }
              }}
              className="rounded-lg border border-outline-variant/30 bg-surface-container/80 px-2 py-1 text-xs font-semibold text-on-surface focus:border-primary focus:outline-none"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.tag})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Grounding toggle */}
            <button
              onClick={() => setUseSearch(!useSearch)}
              title="Activer la recherche Google en direct avec Gemini 3.5 Flash"
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                useSearch
                  ? "border-primary bg-primary/20 text-primary shadow-sm shadow-primary/20"
                  : "border-outline-variant/20 bg-surface-container/50 text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <MaterialIcon
                name="travel_explore"
                className={`text-[16px] ${useSearch ? "text-primary" : ""}`}
              />
              <span>Recherche Web</span>
              {useSearch && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
            </button>

            {/* Role selector */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-lg border border-outline-variant/30 bg-surface-container/80 px-2 py-1 text-xs text-on-surface-variant focus:border-primary focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  Rôle: {r.name}
                </option>
              ))}
            </select>

            {/* Live voice mode trigger */}
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-secondary px-2.5 py-1 text-xs font-bold text-white shadow-md shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
            >
              <MaterialIcon name="graphic_eq" className="text-[16px]" />
              <span className="hidden sm:inline">Mode Vocal</span>
            </button>

            {/* New chat */}
            <button
              onClick={startNewChat}
              title="Nouvelle conversation"
              className="flex items-center gap-1 rounded-lg border border-outline-variant/20 p-1 text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
            >
              <MaterialIcon name="add" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-sm py-md pb-36 md:px-gutter">
        <div className="mx-auto flex w-full max-w-[800px] flex-col gap-6">
          {activeConv?.messages.map((m) => {
            const isUser = m.role === "user";

            if (isUser) {
              return (
                <div
                  key={m.id}
                  className="ml-auto flex max-w-[90%] flex-col items-end gap-1.5 md:max-w-[75%]"
                >
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="text-[11px] font-semibold text-on-surface-variant">
                      {profile.name}
                    </span>
                    <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full border border-primary/40 ring-1 ring-primary/20">
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-3xl rounded-tr-sm bg-primary-container px-5 py-3.5 font-body-md text-body-md text-on-primary-container shadow-[0_4px_20px_rgba(128,131,255,0.15)]">
                    <p className="relative z-10 whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  </div>
                  <span className="mr-2 text-right text-[10px] text-on-surface-variant/60">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className="group mr-auto flex w-full max-w-[95%] flex-col gap-2 md:max-w-[88%]"
              >
                {/* AI Label & Model Tag */}
                <div className="flex items-center gap-2 px-1">
                  <MaterialIcon name="auto_awesome" className="text-[18px] text-primary" />
                  <span className="font-label-md text-xs font-bold uppercase tracking-widest text-primary">
                    Paris AI
                  </span>
                  {m.model && (
                    <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-[10px] text-on-surface-variant">
                      {m.model}
                    </span>
                  )}
                  {m.groundingActive && (
                    <span className="flex items-center gap-1 rounded bg-secondary/10 px-1.5 py-0.5 text-[10px] text-secondary">
                      <MaterialIcon name="travel_explore" className="text-[12px]" />
                      Recherche Google
                    </span>
                  )}
                </div>

                {/* AI Response Card */}
                <div className="glass-inner-stroke relative overflow-hidden rounded-2xl rounded-tl-sm border border-outline-variant/20 border-l-[3px] border-l-primary bg-surface-container-high/60 p-4 font-body-md text-body-md text-on-surface backdrop-blur-xl md:p-6">
                  <div className="prose prose-invert max-w-none leading-relaxed text-on-surface [&_a]:text-primary [&_code]:rounded [&_code]:border [&_code]:border-outline-variant/30 [&_code]:bg-surface-container-lowest [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-outline-variant/20 [&_pre]:bg-surface-container-lowest [&_pre]:p-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
                    <Markdown>{m.content}</Markdown>
                  </div>

                  {/* Grounding Citations */}
                  {m.groundingChunks && m.groundingChunks.length > 0 && (
                    <div className="mt-4 border-t border-outline-variant/10 pt-3">
                      <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
                        Sources consultées :
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {m.groundingChunks.map((chunk, cIdx) => (
                          <a
                            key={cIdx}
                            href={chunk.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-full border border-outline-variant/30 bg-surface-container-lowest/80 px-2.5 py-1 text-xs text-primary transition-colors hover:border-primary hover:bg-primary/10"
                          >
                            <MaterialIcon name="link" className="text-[14px]" />
                            <span className="max-w-[200px] truncate">
                              {chunk.title || chunk.uri}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions (Copy, TTS speech, Thumb) */}
                  <div className="mt-4 flex items-center gap-2 border-t border-outline-variant/10 pt-3 text-on-surface-variant">
                    <button
                      onClick={() => handleCopy(m.content, m.id)}
                      title="Copier le texte"
                      className="rounded-md p-1.5 hover:bg-surface-variant/50 hover:text-primary transition-colors"
                    >
                      <MaterialIcon
                        name={copiedId === m.id ? "check" : "content_copy"}
                        className="text-[18px]"
                      />
                    </button>
                    <button
                      onClick={() => handleSpeak(m.content, m.id)}
                      title="Écouter la réponse vocale (TTS)"
                      className={`rounded-md p-1.5 hover:bg-surface-variant/50 transition-colors ${
                        playingId === m.id ? "text-primary animate-pulse" : "hover:text-primary"
                      }`}
                    >
                      <MaterialIcon
                        name={playingId === m.id ? "volume_up" : "volume_down"}
                        className="text-[18px]"
                      />
                    </button>
                    <span className="text-[11px] text-on-surface-variant/40 ml-auto">
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Animation */}
          {isLoading && (
            <div className="mr-auto flex w-full max-w-[80%] flex-col gap-2 md:max-w-[60%]">
              <div className="flex items-center gap-2 px-1">
                <MaterialIcon
                  name="auto_awesome"
                  className="animate-spin text-[18px] text-primary"
                />
                <span className="font-label-md text-xs font-bold uppercase tracking-widest text-primary">
                  Paris réfléchit...
                </span>
              </div>
              <div className="glass-inner-stroke relative overflow-hidden rounded-2xl rounded-tl-sm border border-outline-variant/20 border-l-[3px] border-l-primary bg-surface-container-high/40 p-5 backdrop-blur-xl">
                <div className="animate-pulse space-y-3">
                  <div className="h-2.5 w-full rounded-full bg-primary/20" />
                  <div className="h-2.5 w-5/6 rounded-full bg-primary/20" />
                  <div className="h-2.5 w-3/4 rounded-full bg-primary/20" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating Bottom Input Bar */}
      <footer className="fixed bottom-0 z-40 w-full bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/95 to-transparent px-sm pb-4 pt-6 md:px-gutter">
        <div className="mx-auto max-w-[800px]">
          {/* File Attachment Pill Preview */}
          {attachedFile && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary">
              <MaterialIcon name="attach_file" className="text-[16px]" />
              <span className="font-semibold truncate max-w-xs">{attachedFile.name}</span>
              <button
                onClick={() => setAttachedFile(null)}
                className="ml-auto rounded-full p-0.5 hover:bg-primary/20"
              >
                <MaterialIcon name="close" className="text-[14px]" />
              </button>
            </div>
          )}

          <div className="glass-inner-stroke relative flex items-end gap-2 rounded-[32px] border border-outline-variant/20 bg-surface-container/85 p-2 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-[0_0_25px_rgba(99,102,241,0.2)]">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.txt,.csv,.json"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Joindre un document ou une image"
              aria-label="Ajouter une pièce jointe"
              className="mb-0.5 ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-variant/50 hover:text-on-surface"
            >
              <MaterialIcon name="add_circle" className="text-[24px]" />
            </button>

            <div className="mb-0.5 flex min-h-[44px] flex-1 items-center">
              <textarea
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Posez votre question à Paris AI (Entrée pour envoyer)..."
                style={{ lineHeight: 1.5 }}
                className="max-h-[120px] w-full resize-none overflow-y-auto no-scrollbar border-none bg-transparent py-2.5 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="mb-0.5 mr-1 flex shrink-0 items-center gap-1">
              <button
                onClick={() => setIsVoiceOpen(true)}
                title="Démarrer la conversation vocale en direct"
                aria-label="Mode vocal en direct"
                className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-variant/50 hover:text-primary"
              >
                <MaterialIcon name="mic" className="text-[24px]" />
              </button>
              <button
                onClick={() => handleSend()}
                disabled={isLoading || (!message.trim() && !attachedFile)}
                aria-label="Envoyer le message"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-container hover:text-on-primary-container disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MaterialIcon
                  name={isLoading ? "hourglass_top" : "arrow_upward"}
                  filled
                  className={`text-[22px] ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
          <p className="mt-2 text-center font-caption text-xs text-on-surface-variant/60">
            Paris AI est propulsé par Gemini 3.5 Flash, 3.1 Pro et Veo 3. Vérifiez les informations
            importantes.
          </p>
        </div>
      </footer>
    </AppShell>
  );
}
