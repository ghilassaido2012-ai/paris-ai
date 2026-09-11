import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";

export const Route = createFileRoute("/creer")({
  head: () => ({
    meta: [
      { title: "Paris AI - Créer" },
      {
        name: "description",
        content:
          "Créez des images grâce à l'IA : décrivez votre idée, ajustez les paramètres avancés et générez votre visuel avec Paris AI.",
      },
      { property: "og:title", content: "Paris AI - Créer" },
      {
        property: "og:description",
        content:
          "Créez des images grâce à l'IA : décrivez votre idée, ajustez les paramètres avancés et générez votre visuel avec Paris AI.",
      },
    ],
  }),
  component: Creer,
});

const STYLES = [
  { icon: "camera", label: "Réaliste" },
  { icon: "view_in_ar", label: "3D" },
  { icon: "brush", label: "Anime" },
  { icon: "palette", label: "Digital Art" },
] as const;

const RATIOS = [
  { label: "1:1", className: "w-8 h-8" },
  { label: "16:9", className: "w-10 h-6" },
  { label: "9:16", className: "w-6 h-10" },
] as const;

function Creer() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState<(typeof STYLES)[number]["label"]>("Réaliste");
  const [ratio, setRatio] = useState<(typeof RATIOS)[number]["label"]>("1:1");
  const [quality, setQuality] = useState(80);

  const qualityLabel = quality >= 66 ? "Haute" : quality >= 33 ? "Moyenne" : "Basse";

  return (
    <AppShell title="Paris AI" centeredBrand>
      <main className="mx-auto w-full max-w-[1200px] flex-1 grid grid-cols-1 items-start gap-lg p-gutter pb-24 md:pb-gutter lg:grid-cols-12">
        {/* Controls Column */}
        <div className="flex flex-col gap-lg lg:col-span-7">
          {/* Prompt Input */}
          <section className="glass-card relative flex flex-col gap-sm rounded-xl border-t border-t-white/10 p-md shadow-lg">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-primary to-secondary" />
            <label
              className="flex items-center gap-xs font-label-md text-label-md uppercase tracking-widest text-primary"
              htmlFor="prompt"
            >
              <MaterialIcon name="edit" />
              Description de l'image
            </label>
            <textarea
              id="prompt"
              className="w-full resize-none rounded-lg border border-outline-variant/30 bg-surface-container/50 p-sm text-body-lg font-body-lg text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Décrivez en détail l'image que vous souhaitez générer..."
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </section>

          {/* Advanced Settings Toggle */}
          <details className="group glass-card rounded-xl border-t border-t-white/10 shadow-lg">
            <summary className="flex list-none select-none items-center justify-between p-md font-label-md text-label-md uppercase tracking-widest text-on-surface [&::-webkit-details-marker]:hidden">
              <div className="flex items-center gap-xs">
                <MaterialIcon name="tune" className="text-primary" />
                Paramètres Avancés
              </div>
              <MaterialIcon
                name="expand_more"
                className="text-outline transition-transform duration-300 group-open:rotate-180"
              />
            </summary>
            <div className="mt-xs flex flex-col gap-lg border-t border-white/5 p-md pt-0">
              {/* Negative Prompt */}
              <div className="flex flex-col gap-xs">
                <label
                  className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant"
                  htmlFor="negative_prompt"
                >
                  Invite Négative
                </label>
                <input
                  id="negative_prompt"
                  type="text"
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container/30 p-xs text-body-md font-body-md text-on-surface transition-colors placeholder:text-on-surface-variant/40 focus:border-primary"
                  placeholder="Ce qu'il faut exclure..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                />
              </div>

              {/* Styles */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">
                  Style Visuel
                </label>
                <div className="no-scrollbar flex gap-sm overflow-x-auto pb-xs">
                  {STYLES.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setStyle(s.label)}
                      className={`flex min-w-[80px] flex-col items-center gap-xs rounded-lg border p-xs transition-colors ${
                        style === s.label
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:text-on-surface"
                      }`}
                    >
                      <MaterialIcon name={s.icon} className="text-3xl" />
                      <span className="font-caption text-caption">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant">
                  Format
                </label>
                <div className="flex gap-sm">
                  {RATIOS.map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => setRatio(r.label)}
                      className={`flex flex-1 flex-col items-center justify-center gap-xs rounded-lg border p-sm transition-colors ${
                        ratio === r.label
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:text-on-surface"
                      }`}
                    >
                      <div className={`${r.className} rounded-sm border-2 border-current`} />
                      <span className="font-caption text-caption">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider */}
              <div className="flex flex-col gap-xs">
                <div className="flex items-center justify-between">
                  <label
                    className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant"
                    htmlFor="quality"
                  >
                    Qualité / Détail
                  </label>
                  <span className="font-caption text-caption text-primary">{qualityLabel}</span>
                </div>
                <input
                  id="quality"
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-container-high accent-primary"
                />
              </div>
            </div>
          </details>

          {/* Action Button */}
          <button
            type="button"
            className="glow-button group relative flex w-full items-center justify-center gap-sm overflow-hidden rounded-xl bg-gradient-to-r from-primary-container to-secondary-container py-md font-headline-lg-mobile text-headline-lg-mobile font-bold text-white"
          >
            <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 ease-out group-hover:translate-y-0" />
            <MaterialIcon name="magic_button" className="relative z-10" />
            <span className="relative z-10">Générer l'Image</span>
          </button>
        </div>

        {/* Preview Column */}
        <div className="group relative flex h-[500px] flex-col items-center justify-center overflow-hidden rounded-xl glass-card border-t border-t-white/10 shadow-lg lg:col-span-5 lg:aspect-square lg:h-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 opacity-50 transition-opacity duration-500 group-hover:opacity-80" />
          <div className="absolute left-sm top-sm h-4 w-4 border-l-2 border-t-2 border-primary/50" />
          <div className="absolute right-sm top-sm h-4 w-4 border-r-2 border-t-2 border-secondary/50" />
          <div className="absolute bottom-sm left-sm h-4 w-4 border-b-2 border-l-2 border-primary/50" />
          <div className="absolute bottom-sm right-sm h-4 w-4 border-b-2 border-r-2 border-secondary/50" />
          <div className="relative z-10 flex flex-col items-center gap-md p-md text-center">
            <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full border border-white/10 bg-surface-container shadow-lg">
              <MaterialIcon name="image" className="text-3xl text-primary" />
            </div>
            <p className="max-w-[250px] font-body-md text-body-md text-on-surface-variant">
              L'aperçu de votre image générée apparaîtra ici.
            </p>
          </div>
        </div>
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-xl border-t border-white/10 bg-surface-container-high/80 px-4 py-2 shadow-lg backdrop-blur-lg md:hidden">
        <a
          href="#"
          className="flex flex-col items-center justify-center p-3 text-on-surface-variant transition-all duration-200 hover:text-primary active:scale-90"
        >
          <MaterialIcon name="bolt" />
        </a>
        <a
          href="#"
          className="flex flex-col items-center justify-center p-3 text-on-surface-variant transition-all duration-200 hover:text-primary active:scale-90"
        >
          <MaterialIcon name="history" />
        </a>
        <a
          href="#"
          className="flex flex-col items-center justify-center rounded-full bg-primary-container/20 p-3 text-primary shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-200 hover:text-primary active:scale-90"
        >
          <MaterialIcon name="auto_awesome" />
        </a>
        <a
          href="#"
          className="flex flex-col items-center justify-center p-3 text-on-surface-variant transition-all duration-200 hover:text-primary active:scale-90"
        >
          <MaterialIcon name="person" />
        </a>
      </nav>
    </AppShell>
  );
}
