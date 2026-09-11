import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";

export const Route = createFileRoute("/analyse")({
  head: () => ({
    meta: [
      { title: "Paris AI — Analyse de fichiers" },
      {
        name: "description",
        content:
          "Importez vos fichiers et analysez-les avec Paris AI : PDF, images et CSV pris en charge.",
      },
      { property: "og:title", content: "Paris AI — Analyse de fichiers" },
      {
        property: "og:description",
        content:
          "Importez vos fichiers et analysez-les avec Paris AI : PDF, images et CSV pris en charge.",
      },
    ],
  }),
  component: Analyse,
});

function Analyse() {
  const [message, setMessage] = useState("");

  return (
    <AppShell title="Paris AI" showAmbientGlow>
      <main className="relative flex h-full flex-1 flex-col overflow-hidden">
        {/* Canvas (Scrollable content) */}
        <div className="w-full flex-1 overflow-y-auto px-sm pb-[140px] pt-md md:px-lg md:pb-[100px]">
          <div className="mx-auto flex w-full max-w-[800px] flex-col gap-lg">
            {/* Page Intent Header */}
            <div className="mb-sm mt-md text-center md:mt-xl md:text-left">
              <h2 className="mb-2 font-headline-lg text-headline-lg text-on-surface">
                Espace de Travail Documentaire
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Importez vos fichiers et commencez à analyser avec Paris AI.
              </p>
            </div>

            {/* Dropzone Area */}
            <div className="group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/40 bg-surface-container-lowest/50 p-lg text-center transition-all duration-300 hover:border-primary/50 hover:bg-surface-container hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] md:p-xl">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-variant/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary-container/20">
                <MaterialIcon name="cloud_upload" className="text-[32px] text-primary" />
              </div>
              <h3 className="mb-2 font-headline-lg-mobile text-headline-lg-mobile text-on-surface md:font-headline-lg md:text-headline-lg">
                Glissez-déposez vos fichiers ici
              </h3>
              <p className="mb-8 max-w-sm font-body-md text-body-md text-on-surface-variant">
                Supporte PDF, PNG, JPG, CSV. La taille maximale par fichier est de 50MB.
              </p>
              {/* Primary Button */}
              <button className="flex items-center gap-2 rounded-lg bg-gradient-to-b from-inverse-primary to-primary-container px-6 py-3 font-label-md text-label-md text-white shadow-lg transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                <MaterialIcon name="add" className="text-[20px]" />
                Importer un fichier
              </button>
            </div>

            {/* Uploaded Files List (Bento-style layout) */}
            <div className="mt-4 flex w-full flex-col gap-4">
              <h4 className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant opacity-80">
                Fichiers Récents (2)
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* File 1: Analyzing State */}
                <div className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container p-4">
                  <div className="absolute left-0 right-0 top-0 h-[1px] bg-white/10" />
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tertiary-container/20 text-tertiary">
                    <MaterialIcon name="image" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body-md text-body-md text-on-surface">
                      schema_architecture_v2.png
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1 font-caption text-caption text-tertiary">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-tertiary" />
                        Analyse en cours...
                      </span>
                    </div>
                  </div>
                  <button className="rounded-full p-2 text-on-surface-variant opacity-0 transition-colors hover:bg-error/10 hover:text-error focus:opacity-100 group-hover:opacity-100">
                    <MaterialIcon name="close" />
                  </button>
                </div>
                {/* File 2: Completed State */}
                <div className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container p-4">
                  <div className="absolute left-0 right-0 top-0 h-[1px] bg-white/10" />
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-container/20 text-primary">
                    <MaterialIcon name="description" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body-md text-body-md text-on-surface">
                      Rapport_Financier_Q3.pdf
                    </p>
                    <p className="mt-1 font-caption text-caption text-on-surface-variant">
                      4.2 MB • Terminé
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center">
                    <MaterialIcon name="check_circle" filled className="text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="pointer-events-none absolute bottom-0 left-0 z-30 mb-[80px] w-full px-sm md:bottom-6 md:mb-0 md:px-0">
          <div className="pointer-events-auto relative mx-auto w-full max-w-[800px]">
            {/* Ambient Glow behind input */}
            <div className="absolute inset-0 -z-10 h-16 -translate-y-4 transform rounded-full bg-primary/10 blur-2xl" />
            <div className="flex items-center rounded-2xl border border-outline-variant/40 bg-surface-container-high/90 p-2 shadow-lg backdrop-blur-xl transition-colors focus-within:border-primary/60 focus-within:bg-surface-container-highest">
              <button className="rounded-xl p-3 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary">
                <MaterialIcon name="attach_file" />
              </button>
              <input
                className="flex-1 border-none bg-transparent px-3 font-body-lg text-body-lg text-on-surface outline-none placeholder-on-surface-variant/60 focus:ring-0"
                placeholder="Posez une question sur vos documents..."
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-inverse-primary p-3 text-white shadow-md transition-opacity hover:opacity-90">
                <MaterialIcon name="arrow_upward" filled />
              </button>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
