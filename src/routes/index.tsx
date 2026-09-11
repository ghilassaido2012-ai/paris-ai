import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Paris AI — Bonjour, comment puis-je vous aider ?" },
      {
        name: "description",
        content:
          "Paris AI, votre assistant intelligent pour la recherche, la création et l'analyse. Posez une question, générez une image ou analysez un fichier.",
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
}[] = [
  {
    icon: "school",
    title: "Explique-moi un sujet",
    subtitle: "Simplifier des concepts complexes",
    iconBg: "bg-primary-container/10",
    iconColor: "text-primary",
    to: "/chat",
  },
  {
    icon: "image",
    title: "Crée une image",
    subtitle: "Générer des visuels uniques",
    iconBg: "bg-tertiary-container/10",
    iconColor: "text-tertiary",
    to: "/images",
  },
  {
    icon: "analytics",
    title: "Analyse mon fichier",
    subtitle: "Extraire des insights de données",
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
  },
  {
    icon: "language",
    title: "Recherche sur le Web",
    subtitle: "Trouver des informations récentes",
    iconBg: "bg-primary-fixed/10",
    iconColor: "text-primary-fixed",
    span: "md:col-span-2",
    to: "/creer",
  },
];

function Index() {
  const [message, setMessage] = useState("");

  return (
    <AppShell centeredBrand showAmbientGlow>
      <main className="relative z-10 mx-auto flex w-full max-w-[800px] flex-1 flex-col items-center justify-center px-gutter pb-32 pt-16">
        <div className="mb-xl w-full text-center">
          <h1 className="mb-sm font-display-lg text-display-lg font-bold tracking-tighter md:text-[56px] md:leading-[64px]">
            <span className="gradient-text">Bonjour,</span>
            <br />
            comment puis-je vous aider ?
          </h1>
          <p className="mx-auto max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
            Votre assistant intelligent pour la recherche, la création et l'analyse.
          </p>
        </div>

        <div className="mb-xl grid w-full grid-cols-1 gap-sm md:grid-cols-2 lg:grid-cols-3">
          {PROMPTS.map((p) => (
            <Link
              key={p.title}
              to={p.to}
              className={cn(
                "group glass-card flex h-full flex-col items-start gap-sm rounded-xl p-md text-left transition-all duration-300",
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
            </Link>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 z-40 w-full bg-gradient-to-t from-background via-background/90 to-transparent px-gutter pb-md pt-xl">
        <div className="mx-auto max-w-[800px]">
          <div className="glass-card relative flex items-end gap-2 rounded-[32px] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50">
            <button
              aria-label="Joindre un fichier"
              className="shrink-0 rounded-full p-3 text-on-surface-variant transition-colors duration-200 hover:bg-surface-variant/50 hover:text-on-surface"
            >
              <MaterialIcon name="attach_file" />
            </button>
            <textarea
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Posez une question ou tapez '/' pour les commandes..."
              className="max-h-32 min-h-[48px] w-full resize-none border-none bg-transparent px-2 py-3 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0"
            />
            <div className="flex shrink-0 items-center gap-1 pb-1 pr-1">
              <button
                aria-label="Dictée vocale"
                className="rounded-full p-2 text-on-surface-variant transition-colors duration-200 hover:bg-surface-variant/50 hover:text-on-surface"
              >
                <MaterialIcon name="mic" />
              </button>
              <Link
                to="/chat"
                aria-label="Envoyer"
                className="rounded-full bg-primary p-2 text-on-primary shadow-lg shadow-primary/20 transition-colors duration-200 hover:bg-primary-container hover:text-on-primary-container"
              >
                <MaterialIcon name="arrow_upward" filled />
              </Link>
            </div>
          </div>
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
