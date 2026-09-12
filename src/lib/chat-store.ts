export type MessageRole = "user" | "model" | "assistant";

export type GroundingChunk = {
  uri: string;
  title: string;
};

export type ChatItem = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  model?: string;
  groundingChunks?: GroundingChunk[];
  groundingActive?: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  systemInstruction?: string;
  useSearch?: boolean;
  messages: ChatItem[];
};

const STORAGE_KEY = "paris_ai_conversations";
const ACTIVE_CONV_KEY = "paris_ai_active_conv_id";

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load conversations:", e);
    return [];
  }
}

export function saveConversations(convs: Conversation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  } catch (e) {
    console.error("Failed to save conversations:", e);
  }
}

export function getActiveConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_CONV_KEY);
}

export function setActiveConversationId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_CONV_KEY, id);
}

export function createNewConversation(
  initialTitle = "Nouvelle conversation",
  model = "gemini-3.5-flash",
  useSearch = false,
  systemInstruction?: string,
): Conversation {
  const newConv: Conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: initialTitle,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    model,
    useSearch,
    systemInstruction,
    messages: [
      {
        id: `msg_welcome`,
        role: "model",
        content:
          "Bonjour ! Je suis Paris, votre assistant intelligent bilingue. Comment puis-je vous aider aujourd'hui ?",
        timestamp: Date.now(),
        model,
      },
    ],
  };

  const all = loadConversations();
  saveConversations([newConv, ...all]);
  setActiveConversationId(newConv.id);
  return newConv;
}

export function updateConversation(
  convId: string,
  updater: (prev: Conversation) => Conversation,
): Conversation | null {
  const all = loadConversations();
  const idx = all.findIndex((c) => c.id === convId);
  if (idx === -1) return null;

  const updated = updater(all[idx]);
  updated.updatedAt = Date.now();
  all[idx] = updated;
  saveConversations(all);
  return updated;
}
