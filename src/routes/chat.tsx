import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Conversation — Paris AI" },
      {
        name: "description",
        content:
          "Discutez avec Paris, l'assistant Paris AI : réponses détaillées, blocs de code et suivi de vos conversations.",
      },
      { property: "og:title", content: "Conversation — Paris AI" },
      {
        property: "og:description",
        content: "Réponses détaillées, blocs de code copiables et historique de vos échanges.",
      },
    ],
  }),
  component: ChatScreen;
});

function AiLabel({ label = "Paris", pulse = false }: { label?: string; pulse?: boolean }) {
  return (
    <div className="mb-1 flex items-center gap-2 px-1">
      <MaterialIcon
        name="auto_awesome"
        className={`text-[18px] text-primary ${pulse ? "animate-pulse" : ""}`}
      />
      <span className="font-label-md text-label-md uppercase tracking-widest text-primary">
        {label}
      </span>
    </div>
  );
}

function MessageActions() {
  return (
    <div className="mt-4 flex items-center gap-1 border-t border-outline-variant/10 pt-4 opacity-60 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
      <button title="Copier" className="group/btn rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-variant/50">
        <MaterialIcon name="content_copy" className="text-[18px] transition-colors group-hover/btn:text-primary" />
      </button>
      <button title="Régénérer" className="group/btn rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-variant/50">
        <MaterialIcon name="refresh" className="text-[18px] transition-colors group-hover/btn:text-primary" />
      </button>
      <div className="flex-1" />
      <button title="J'aime" className="group/btn rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-variant/50">
        <MaterialIcon name="thumb_up" className="text-[18px] transition-colors group-hover/btn:text-primary" />
      </button>
      <button title="Je n'aime pas" className="group/btn rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-variant/50">
        <MaterialIcon name="thumb_down" className="text-[18px] transition-colors group-hover/btn:text-error" />
      </button>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-auto flex max-w-[90%] flex-col gap-2 md:max-w-[75%]">
      <div className="relative overflow-hidden rounded-3xl rounded-tr-sm bg-primary-container px-5 py-3.5 font-body-md text-body-md text-on-primary-container shadow-[0_4px_20px_rgba(128,131,255,0.15)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        <p className="relative z-10 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

const CODE_LINES = `import requests
import json

def fetch_space_news():
    url = "https://api.spaceflightnewsapi.net/v4/articles"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # Raises HTTPError for bad responses

        data = response.json()
        return data.get('results', [])

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return None`;

function ChatScreen() {
  const [message, setMessage] = useState("");

  return (
    <AppShell className="h-screen">
      <main className="flex w-full flex-1 flex-col overflow-y-auto no-scrollbar">
        <div className="mx-auto flex w-full max-w-[800px] flex-col gap-lg px-sm py-lg pb-32 md:px-gutter">
          {/* AI greeting */}
          <div className="mr-auto flex max-w-[90%] flex-col gap-2 md:max-w-[85%]">
            <AiLabel />
            <div className="group glass-inner-stroke relative overflow-hidden rounded-2xl rounded-tl-sm border border-outline-variant/20 border-l-[3px] border-l-primary bg-surface-container-high/60 p-4 font-body-md text-body-md text-on-surface backdrop-blur-xl md:p-6">
              <p className="leading-relaxed">
                Bonjour! I am Paris, your intelligent assistant. How can I help you architect your
                solutions today?
              </p>
              <MessageActions />
            </div>
          </div>

          <UserBubble>
            Can you write a Python script to fetch the latest space news and parse the JSON
            response? Make sure to handle potential API errors.
          </UserBubble>

          {/* AI detailed answer */}
          <div className="mr-auto flex max-w-[95%] flex-col gap-2 md:max-w-[85%]">
            <AiLabel />
            <div className="group glass-inner-stroke relative flex flex-col gap-4 rounded-2xl rounded-tl-sm border border-outline-variant/20 border-l-[3px] border-l-primary bg-surface-container-high/60 p-4 font-body-md text-body-md text-on-surface backdrop-blur-xl md:p-6">
              <p className="leading-relaxed">
                Certainly. Here is a Python script utilizing the{" "}
                <code className="rounded border border-outline-variant/30 bg-surface-container-lowest px-1.5 py-0.5 font-mono text-sm text-primary">
                  requests
                </code>{" "}
                library to fetch and parse data from a generic space news API endpoint.
              </p>

              <div className="my-2 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                <div className="flex items-center justify-between border-b border-outline-variant/20 bg-surface-container-low px-4 py-2">
                  <span className="font-mono font-label-md text-label-md text-on-surface-variant">
                    python
                  </span>
                  <button className="flex items-center gap-1 font-label-md text-xs text-on-surface-variant transition-colors hover:text-primary">
                    <MaterialIcon name="content_copy" className="text-[14px]" />
                    Copy code
                  </button>
                </div>
                <div className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
                  <pre>
                    <code className="text-on-surface-variant">{CODE_LINES}</code>
                  </pre>
                </div>
              </div>

              <p className="leading-relaxed">
                This script includes a{" "}
                <code className="rounded border border-outline-variant/30 bg-surface-container-lowest px-1.5 py-0.5 font-mono text-sm text-primary">
                  try-except
                </code>{" "}
                block to elegantly catch network anomalies, ensuring your application remains
                stable.
              </p>
              <MessageActions />
            </div>
          </div>

          <div className="mt-4">
            <UserBubble>
              Fascinating. Now, architect a system to cache this data locally using Redis.
            </UserBubble>
          </div>

          {/* Loading shimmer */}
          <div className="mr-auto mt-2 flex max-w-[80%] flex-col gap-2 md:max-w-[60%]">
            <AiLabel label="Processing" pulse />
            <div className="relative overflow-hidden rounded-2xl rounded-tl-sm border border-outline-variant/10 border-l-[3px] border-l-surface-variant bg-surface-container-high/40 p-5 backdrop-blur-xl">
              <div className="animate-shimmer absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-primary-container/10 to-transparent" />
              <div className="flex flex-col gap-3">
                <div className="h-2.5 w-full rounded-full bg-surface-variant/50" />
                <div className="h-2.5 w-5/6 rounded-full bg-surface-variant/50" />
                <div className="mt-2 h-2.5 w-4/6 rounded-full bg-surface-variant/50" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 z-50 w-full bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/90 to-transparent px-sm pb-4 pt-8 md:px-gutter">
        <div className="glass-inner-stroke relative mx-auto flex max-w-[800px] items-end gap-2 rounded-[32px] border border-outline-variant/20 bg-surface-container/80 p-2 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-[0_0_20px_rgba(99,102,241,0.15)]">
          <button
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
              placeholder="Écrivez votre message..."
              style={{ lineHeight: 1.5 }}
              className="max-h-[120px] w-full resize-none overflow-y-auto no-scrollbar border-none bg-transparent py-2.5 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
            />
          </div>
          <div className="mb-0.5 mr-1 flex shrink-0 items-center gap-1">
            <button
              aria-label="Dictée vocale"
              className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-variant/50 hover:text-on-surface"
            >
              <MaterialIcon name="mic" className="text-[24px]" />
            </button>
            <button
              aria-label="Envoyer le message"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg shadow-primary/20 transition-colors hover:bg-primary-container hover:text-on-primary-container"
            >
              <MaterialIcon name="arrow_upward" filled className="text-[22px]" />
            </button>
          </div>
        </div>
        <p className="mt-3 text-center font-caption text-caption text-on-surface-variant/60">
          Paris AI peut faire des erreurs. Vérifiez les informations importantes.
        </p>
      </footer>
    </AppShell>
  );
}
