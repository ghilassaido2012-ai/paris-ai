import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";
import { VoiceChatModal } from "@/components/VoiceChatModal";
import { useUserProfile } from "@/lib/user-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Paris AI — Bonjour, comment puis-je vous aider ?" },
      {
        name: "description",
        content:
          "Paris AI, votre assistant intelligent pour la recherche, la création d'images, de vidéos Veo 3 et l'analyse.",
      },
      { property: "og:title", content: "Paris AI — Votre assistant intelligent" },
      {
        property: "og:description",
        content: "Recherche, création d'images et analyse de fichiers, dans une seule interface.",
      },
    ],
  }),
  component: Index,
});

const PROMPTS: {
  icon: string;
  title: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
  span?: string;
  to: "/chat" | "/images" | "/analyse" | "/creer";
  defaultPrompt?: string;
}[] = [
  {
    icon: "school",
    title: "Explique-moi un sujet",
    subtitle: "Simplifier des concepts complexes",
    iconBg: "bg-primary-container/10",
    iconColor: "text-primary",
    to: "/chat",
    defaultPrompt:
      "Peux-tu m'expliquer la mécanique quantique simplement avec des analogies du quotidien ?",
  },
  {
    icon: "image",
    title: "Crée une image",
    subtitle: "Générer des visuels avec Gemini 3.1",
    iconBg: "bg-tertiary-container/10",
    iconColor: "text-tertiary",
    to: "/creer",
  },
  {
    icon: "videocam",
    title: "Génère une vidéo Veo",
    subtitle: "Création cinématographique Google Veo 3",
    iconBg: "bg-secondary-container/10",
    iconColor: "text-secondary",
    to: "/creer",
  },
  {
    icon: "analytics",
    title: "Analyse mon fichier",
    subtitle: "Extraire des insights de documents",
    iconBg: "bg-secondary-container/10",
    iconColor: "text-secondary",
    span: "md:col-span-2 lg:col-span-1",
    to: "/analyse",
  },
  {
    icon: "code",
    title: "Écris du code",
    subtitle: "Développer des scripts et fonctions",
    iconBg: "bg-surface-tint/10",
    iconColor: "text-surface-tint",
    to: "/chat",
    defaultPrompt:
      "Écris une fonction TypeScript propre pour valider et formater des numéros de téléphone.",
  },
  {
    icon: "language",
    title: "Recherche sur le Web",
    subtitle: "Trouver des informations récentes en direct",
    iconBg: "bg-primary-fixed/10",
    iconColor: "text-primary-fixed",
    span: "md:col-span-2",
    to: "/chat",
    defaultPrompt: "Quelles sont les dernières actualités technologiques de la semaine ?",
  },
];

function Index() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const { profile } = useUserProfile();

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) {
      navigate({ to: "/chat" });
      return;
    }
    navigate({
      to: "/chat",
      search: (prev: Record<string, unknown>) => ({ ...prev, q: message.trim() }),
    });
  };

  return (
    <AppShell centeredBrand showAmbientGlow>
      <VoiceChatModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />

      <main className="relative z-10 mx-auto flex w-full max-w-[800px] flex-1 flex-col items-center justify-center px-gutter pb-36 pt-12">
        <div className="mb-xl w-full text-center">
          <h1 className="mb-sm font-display-lg text-display-lg font-bold tracking-tighter md:text-[56px] md:leading-[64px]">
            <span className="gradient-text">Bonjour {profile.name},</span>
            <br />
            comment puis-je vous aider ?
          </h1>
          <p className="mx-auto max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
            Votre assistant intelligent pour la recherche, la création d'images & vidéos et
            l'analyse.
          </p>
        </div>

        <div className="mb-xl grid w-full grid-cols-1 gap-sm md:grid-cols-2 lg:grid-cols-3">
          {PROMPTS.map((p) => (
            <a
              key={p.title}
              href={p.defaultPrompt ? `${p.to}?q=${encodeURIComponent(p.defaultPrompt)}` : p.to}
              className={cn(
                "group glass-card flex h-full flex-col items-start gap-sm rounded-xl p-md text-left transition-all duration-300 hover:border-primary/40 hover:shadow-lg",
                p.span,
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
                  p.iconBg,
                  p.iconColor,
                )}
              >
                <MaterialIcon name={p.icon} />
              </div>
              <div>
                <h3 className="mb-base text-lg font-semibold leading-tight text-on-surface">
                  {p.title}
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant">{p.subtitle}</p>
              </div>
            </a>
          ))}
        </div>
      </main>

      {/* Fixed bottom input */}
      <div className="fixed bottom-0 left-0 z-40 w-full bg-gradient-to-t from-background via-background/95 to-transparent px-gutter pb-md pt-xl">
        <div className="mx-auto max-w-[800px]">
          <form
            onSubmit={handleSubmit}
            className="glass-card relative flex items-end gap-2 rounded-[32px] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50"
          >
            <Link
              to="/analyse"
              aria-label="Joindre un fichier"
              className="shrink-0 rounded-full p-3 text-on-surface-variant transition-colors duration-200 hover:bg-surface-variant/50 hover:text-on-surface"
            >
              <MaterialIcon name="attach_file" />
            </Link>
            <textarea
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Posez une question ou demandez une création à Paris AI..."
              className="max-h-32 min-h-[48px] w-full resize-none border-none bg-transparent px-2 py-3 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
            />
            <div className="flex shrink-0 items-center gap-1 pb-1 pr-1">
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                aria-label="Conversation vocale en direct"
                className="rounded-full p-2 text-on-surface-variant transition-colors duration-200 hover:bg-surface-variant/50 hover:text-primary"
              >
                <MaterialIcon name="mic" />
              </button>
              <button
                type="submit"
                aria-label="Envoyer"
                className="rounded-full bg-primary p-2 text-on-primary shadow-lg shadow-primary/20 transition-colors duration-200 hover:bg-primary-container hover:text-on-primary-container"
              >
                <MaterialIcon name="arrow_upward" filled />
              </button>
            </div>
          </form>
          <div className="mt-3 text-center">
            <p className="font-caption text-caption text-on-surface-variant/60">
              Paris AI peut faire des erreurs. Vérifiez les informations importantes.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
