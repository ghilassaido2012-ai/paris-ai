import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";

export const Route = createFileRoute("/creer")({
  head: () => ({
    meta: [
      { title: "Paris AI — Studio Créatif (Images & Vidéos Veo 3)" },
      {
        name: "description",
        content:
          "Créez et retouchez des images avec Gemini 3.1 Flash Image, ou animez vos photos en vidéo avec Google Veo 3.",
      },
      { property: "og:title", content: "Paris AI — Studio Créatif" },
      {
        property: "og:description",
        content: "Génération d'images et de vidéos cinématographiques avec Veo 3 et Gemini.",
      },
    ],
  }),
  component: Creer,
});

const MODES = [
  {
    id: "image_gen",
    label: "Créer une image",
    icon: "auto_fix_high",
    model: "Gemini 3.1 Flash Image",
  },
  {
    id: "image_edit",
    label: "Retoucher une photo",
    icon: "brush",
    model: "Gemini 3.1 Flash Image",
  },
  { id: "video_gen", label: "Générer une vidéo (Veo)", icon: "videocam", model: "Veo 3.1 Fast" },
] as const;

const STYLES = [
  { icon: "camera", label: "Réaliste" },
  { icon: "view_in_ar", label: "3D Luxueux" },
  { icon: "brush", label: "Anime Japonais" },
  { icon: "palette", label: "Digital Art" },
  { icon: "movie", label: "Cinématique" },
  { icon: "bolt", label: "Cyberpunk" },
] as const;

const RATIOS = [
  { label: "1:1", value: "1:1", className: "w-8 h-8", sub: "Carré" },
  { label: "16:9", value: "16:9", className: "w-10 h-6", sub: "Paysage" },
  { label: "9:16", value: "9:16", className: "w-6 h-10", sub: "Story / Reels" },
] as const;

function Creer() {
  const [activeMode, setActiveMode] = useState<"image_gen" | "image_edit" | "video_gen">(
    "image_gen",
  );
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState<string>("Réaliste");
  const [ratio, setRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");

  // Input photo for edit or video animation
  const [sourceImage, setSourceImage] = useState<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Outputs
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoOperation, setVideoOperation] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !sourceImage) return;

    setIsGenerating(true);
    setErrorMsg("");
    setStatusMessage("");

    try {
      if (activeMode === "image_gen") {
        setStatusMessage("Création de l'image en cours avec Gemini 3.1 Flash Image...");
        const fullPrompt = `${prompt}. Style: ${style}.${negativePrompt ? ` Exclure: ${negativePrompt}` : ""}`;

        const res = await fetch("/api/image/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: fullPrompt,
            aspectRatio: ratio,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Échec de génération d'image.");
        }

        const data = await res.json();
        if (data.imageUrl) {
          setGeneratedImageUrl(data.imageUrl);
          setGeneratedVideoUrl(null);
        } else if (data.text) {
          setStatusMessage(`Remarque : ${data.text}`);
        }
      } else if (activeMode === "image_edit") {
        if (!sourceImage) {
          throw new Error("Veuillez d'abord importer une photo à modifier.");
        }
        setStatusMessage("Retouche de votre photo avec Gemini 3.1 Flash Image...");

        const res = await fetch("/api/image/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: prompt || "Améliore cette image en style artistique haute définition.",
            imageData: sourceImage,
            aspectRatio: ratio,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Échec de la retouche.");
        }

        const data = await res.json();
        if (data.imageUrl) {
          setGeneratedImageUrl(data.imageUrl);
          setGeneratedVideoUrl(null);
        }
      } else if (activeMode === "video_gen") {
        setStatusMessage("Initialisation de Veo 3.1 Fast Generate Preview...");

        const videoRatio = ratio === "9:16" ? "9:16" : "16:9";

        const res = await fetch("/api/video/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: prompt || "Cinematic animation, realistic movement, 4k detail",
            imageData: sourceImage || undefined,
            aspectRatio: videoRatio,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Échec du lancement Veo 3.");
        }

        const data = await res.json();
        const opName = data.operationName;
        setVideoOperation(opName);

        // Poll for video completion
        setStatusMessage("Génération cinématique Veo en cours... (environ 30-60s)");
        let done = false;
        let attempts = 0;

        while (!done && attempts < 30) {
          await new Promise((r) => setTimeout(r, 6000));
          attempts++;

          const checkRes = await fetch("/api/video/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ operationName: opName }),
          });

          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData.done) {
              done = true;
              setStatusMessage("Téléchargement du flux vidéo...");
              setGeneratedVideoUrl(`/api/video/stream?op=${encodeURIComponent(opName)}`);
              setGeneratedImageUrl(null);
              break;
            } else {
              setStatusMessage(`Génération Veo en cours... étape ${attempts}/25`);
            }
          }
        }

        if (!done) {
          setStatusMessage("Le rendu prend plus de temps que prévu. La vidéo sera prête sous peu.");
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Generation error:", msg);
      setErrorMsg(msg || "Une erreur est survenue.");
    } finally {
      setIsGenerating(false);
    }
  };

  const transferToVideoMode = () => {
    if (generatedImageUrl) {
      setSourceImage(generatedImageUrl);
      setActiveMode("video_gen");
      setPrompt("Anime cette image avec un mouvement fluide de caméra et une ambiance vivante.");
    }
  };

  return (
    <AppShell title="Paris AI Studio" centeredBrand>
      <main className="mx-auto w-full max-w-[1250px] flex-1 grid grid-cols-1 items-start gap-lg p-gutter pb-24 md:pb-gutter lg:grid-cols-12">
        {/* Controls Column */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Mode Switcher */}
          <div className="glass-card flex rounded-2xl border border-outline-variant/20 p-1.5 shadow-lg">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMode(m.id);
                  setErrorMsg("");
                  if (m.id === "video_gen" && ratio === "1:1") {
                    setRatio("16:9");
                  }
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 px-2 text-xs font-bold transition-all ${
                  activeMode === m.id
                    ? "bg-gradient-to-r from-primary to-primary-container text-white shadow-md shadow-primary/20"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40"
                }`}
              >
                <MaterialIcon name={m.icon} className="text-[18px]" />
                <span className="truncate">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Model Tag */}
          <div className="flex items-center justify-between px-2 text-xs text-on-surface-variant">
            <span>Moteur d'IA :</span>
            <span className="font-semibold text-primary">
              {MODES.find((m) => m.id === activeMode)?.model}
            </span>
          </div>

          {/* Source Image Uploader (Required for Edit, Optional for Video) */}
          {(activeMode === "image_edit" || activeMode === "video_gen") && (
            <div className="glass-card flex flex-col gap-2 rounded-2xl border border-outline-variant/20 p-4 shadow-md">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleSourceUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 font-label-md text-xs font-bold uppercase tracking-wider text-primary">
                  <MaterialIcon name="image" className="text-[16px]" />
                  {activeMode === "image_edit"
                    ? "Photo à modifier (requise)"
                    : "Photo à animer en vidéo (optionnel)"}
                </label>
                {sourceImage && (
                  <button
                    onClick={() => setSourceImage(null)}
                    className="text-xs text-error hover:underline"
                  >
                    Supprimer
                  </button>
                )}
              </div>

              {sourceImage ? (
                <div className="relative h-44 w-full overflow-hidden rounded-xl border border-outline-variant/30">
                  <img
                    src={sourceImage}
                    alt="Image source"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 rounded-lg bg-black/70 px-3 py-1 text-xs text-white backdrop-blur-md hover:bg-black/90"
                  >
                    Changer l'image
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low/40 p-4 text-center transition-colors hover:border-primary/50 hover:bg-surface-container/60"
                >
                  <MaterialIcon name="cloud_upload" className="text-2xl text-primary mb-1" />
                  <p className="text-xs text-on-surface font-medium">
                    Cliquez pour choisir une photo depuis votre appareil
                  </p>
                  <p className="text-[11px] text-on-surface-variant/60">PNG, JPG jusqu'à 20MB</p>
                </div>
              )}
            </div>
          )}

          {/* Prompt Input */}
          <section className="glass-card relative flex flex-col gap-sm rounded-xl border-t border-t-white/10 p-md shadow-lg">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-gradient-to-b from-primary to-secondary" />
            <label
              className="flex items-center gap-xs font-label-md text-label-md uppercase tracking-widest text-primary"
              htmlFor="prompt"
            >
              <MaterialIcon name="edit" />
              {activeMode === "image_gen"
                ? "Description de l'image souhaitée"
                : activeMode === "image_edit"
                  ? "Instructions de retouche"
                  : "Scénario / Description du mouvement vidéo"}
            </label>
            <textarea
              id="prompt"
              className="w-full resize-none rounded-lg border border-outline-variant/30 bg-surface-container/50 p-sm text-body-lg font-body-lg text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder={
                activeMode === "image_gen"
                  ? "Ex: Une ruelle parisienne sous une pluie lumineuse au coucher du soleil, reflets sur les pavés..."
                  : activeMode === "image_edit"
                    ? "Ex: Ajoute des néons cyberpunk et transforme l'arrière-plan en ville futuriste..."
                    : "Ex: Mouvement de caméra fluide avançant vers la tour Eiffel illuminée avec des étincelles..."
              }
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            {/* Quick Inspiration Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                "Paris au crépuscule",
                "Architecture futuriste",
                "Éclairage néon & verre",
                "Hyperdétail 8K",
              ].map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt((prev) => (prev ? `${prev}, ${tag}` : tag))}
                  className="rounded-full border border-outline-variant/20 bg-surface-container/40 px-2.5 py-0.5 text-[11px] text-on-surface-variant hover:border-primary/40 hover:text-primary transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </section>

          {/* Format & Style Selection */}
          <div className="glass-card rounded-xl border border-outline-variant/20 p-4 shadow-md space-y-4">
            {/* Aspect Ratio */}
            <div>
              <label className="font-label-md text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
                Format d'affichage
              </label>
              <div className="flex gap-2">
                {RATIOS.filter((r) => activeMode !== "video_gen" || r.value !== "1:1").map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRatio(r.value as "1:1" | "16:9" | "9:16")}
                    className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border p-2.5 transition-all ${
                      ratio === r.value
                        ? "border-primary bg-primary/15 text-primary shadow-sm"
                        : "border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
                    }`}
                  >
                    <div className={`${r.className} rounded-sm border-2 border-current`} />
                    <span className="font-bold text-xs">{r.label}</span>
                    <span className="text-[10px] text-on-surface-variant/70">{r.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Styles (for Image Mode) */}
            {activeMode === "image_gen" && (
              <div>
                <label className="font-label-md text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">
                  Style Visuel
                </label>
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {STYLES.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setStyle(s.label)}
                      className={`flex min-w-[90px] flex-col items-center gap-1 rounded-xl border p-2 transition-colors ${
                        style === s.label
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-outline-variant/30 text-on-surface-variant hover:border-primary/50"
                      }`}
                    >
                      <MaterialIcon name={s.icon} className="text-2xl" />
                      <span className="text-xs font-medium">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || (!prompt.trim() && !sourceImage)}
            className="glow-button group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-secondary py-3.5 font-headline-lg-mobile text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MaterialIcon
              name={
                isGenerating
                  ? "hourglass_top"
                  : activeMode === "video_gen"
                    ? "movie"
                    : "magic_button"
              }
              className={`relative z-10 ${isGenerating ? "animate-spin" : ""}`}
            />
            <span className="relative z-10">
              {isGenerating
                ? "Génération en cours..."
                : activeMode === "image_gen"
                  ? "Générer l'Image (Gemini 3.1)"
                  : activeMode === "image_edit"
                    ? "Appliquer la retouche (Gemini 3.1)"
                    : "Générer la Vidéo (Veo 3)"}
            </span>
          </button>

          {errorMsg && (
            <div className="rounded-xl border border-error/30 bg-error/10 p-3 text-xs text-error">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Preview Column */}
        <div className="flex flex-col gap-3 lg:col-span-5">
          <div className="group relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl glass-card border border-outline-variant/20 shadow-xl lg:aspect-square lg:h-auto">
            {/* Image Preview */}
            {generatedImageUrl && (
              <div className="relative h-full w-full">
                <img
                  src={generatedImageUrl}
                  alt="Génération Paris AI"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <div className="flex gap-2">
                    <a
                      href={generatedImageUrl}
                      download="paris-ai-creation.png"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-on-primary shadow-lg hover:bg-primary-container"
                    >
                      <MaterialIcon name="download" className="text-[18px]" />
                      Télécharger
                    </a>
                    <button
                      onClick={transferToVideoMode}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-secondary py-2 text-xs font-bold text-white shadow-lg hover:bg-secondary/80"
                    >
                      <MaterialIcon name="videocam" className="text-[18px]" />
                      Animer avec Veo 3
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Preview */}
            {generatedVideoUrl && (
              <div className="relative h-full w-full flex flex-col items-center justify-center bg-black">
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  className="max-h-full max-w-full rounded-lg"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <a
                    href={generatedVideoUrl}
                    download="paris-ai-veo-video.mp4"
                    className="flex items-center gap-1 rounded-xl bg-primary/90 px-3 py-1.5 text-xs font-bold text-on-primary backdrop-blur-md hover:bg-primary"
                  >
                    <MaterialIcon name="download" className="text-[16px]" />
                    Télécharger MP4
                  </a>
                </div>
              </div>
            )}

            {/* Empty or Generating State */}
            {!generatedImageUrl && !generatedVideoUrl && (
              <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-surface-container shadow-xl ${
                    isGenerating ? "animate-spin text-primary" : "text-primary"
                  }`}
                >
                  <MaterialIcon
                    name={
                      isGenerating
                        ? "hourglass_bottom"
                        : activeMode === "video_gen"
                          ? "videocam"
                          : "auto_awesome"
                    }
                    className="text-3xl"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">
                    {isGenerating ? "Création en cours..." : "Espace d'Aperçu Haute Définition"}
                  </h4>
                  <p className="mt-1 max-w-[260px] text-xs text-on-surface-variant">
                    {statusMessage ||
                      "Votre création (image ou animation Veo 3) s'affichera directement ici."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick link to Gallery */}
          <div className="flex justify-between items-center px-1 text-xs">
            <Link to="/images" className="text-primary hover:underline flex items-center gap-1">
              <MaterialIcon name="photo_library" className="text-[14px]" />
              Explorer la galerie d'images
            </Link>
            <Link
              to="/chat"
              className="text-on-surface-variant hover:text-primary flex items-center gap-1"
            >
              <MaterialIcon name="chat" className="text-[14px]" />
              Retour au Chat
            </Link>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
