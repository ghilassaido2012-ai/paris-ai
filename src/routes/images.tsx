import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";

export const Route = createFileRoute("/images")({
  head: () => ({
    meta: [
      { title: "Paris AI — Galerie & Création d'Images" },
      {
        name: "description",
        content:
          "Générez des variations d'images avec Gemini 3.1 Flash Image, téléchargez-les et animez-les en vidéo avec Veo 3.",
      },
      { property: "og:title", content: "Paris AI — Galerie & Création d'Images" },
      {
        property: "og:description",
        content: "Studio d'images intelligentes et animation vidéo Veo 3.",
      },
    ],
  }),
  component: ImagesPage,
});

type GeneratedImage = {
  id: string;
  version: string;
  src: string;
  alt: string;
  prompt: string;
};

const INITIAL_IMAGES: GeneratedImage[] = [
  {
    id: "img_1",
    version: "V1",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvAIVvyFVz6-SYVeRyP3c0oAnNi2o7Za5WZvnkL9FfGzQ1JVPMDU6Zo7CtlXinO3c7ITMi98Q98Wbddeihz89EpUq3erz9fxSv7km-znw7iNLcmHcobfiMO57quZ16A8rZzjdZvdeagPBrEs4f7ZgAYvNvXZop3dchSlLr8esrgvOgHMoQ0UVURkLfdnbKYO7K7uWl_DaTOe3WuTY5kk5OZOXiynMpQTHR9CDD3b-Fojw8yuzNXQ",
    alt: "Peinture numérique moderne de Paris au crépuscule",
    prompt:
      "Peinture numérique moderne de la skyline de Paris au crépuscule, tons néons bleus et indigos",
  },
  {
    id: "img_2",
    version: "V2",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnFoMXChw-xkXeM4cvGJax5T4OPthnq914R0XMrrpCh5iGHEwCQmOxm6nQRKHAp4hvBjVK99AVfxcoEP1QkuA7Hh4oMvUPGLlSjk4OIy-apDZonLsLiR8J96-KWMQEKgbkGSKS0aXZ_T6Nym8UJws2HUU7SaSUUrFIxy_tIIsN_1L7VzzDhf8ZzeBGwoBun5FxWkfA6gqbVeElykP9voZV6XZLaPv3tkeb4JZwrO8OlagKRdGTxQ",
    alt: "Structure cristalline lumineuse futuriste",
    prompt:
      "Structure cristalline lumineuse flottant au-dessus d'un sol poli noir, lumière violette",
  },
  {
    id: "img_3",
    version: "V3",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9hSAtw0qBzOuOt-3jq2M1X21TzW_rTFG9BSsy2T-ds41I0UeRzHvRtty3awWLmfv-vTrAm02a-eAbMWgC-qKhEyEg0j--3xvnS-qcoTG8nR2Wbft7xXPA23B5eGJupQaLpfPmamLu1KCDw1l52b4ctgzKMwL74PQFF8Sig6HHzgnofjpbDa1Ia5_b4hwVHNXWxNUGJFeg2b4Kur17rR9-oxvTRuTmHYvE4kNvmyPrpYsMC_SNGw",
    alt: "Illustration géométrique sphère d'énergie",
    prompt:
      "Sphère lumineuse solitaire au-dessus de structures géométriques, bleu nuit et violet néon",
  },
  {
    id: "img_4",
    version: "V4",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8Hd-79yWlUd62uvb0hU60hnmKiysa5SYudi9Egv3jA89fwAx7RAsKFH9XNdQOuxeVxAw7yLF9X-gIzbpjfgqD7o7IUzLNowAwxQcrprnQ7YYGh_8MMCj2hOW6d2PiSngspoC_-bxAP5qSejBiXO-kzoSJRWIDGzmWUiyLhnNRQtAJwKAVN2IRLqLJ-geeqd0UA0P0DGLRzy7dCe5hlJhRJdhiykyJ5RxNE_CCYP_7gs3D496fGA",
    alt: "Fluide bioluminescent et verre",
    prompt: "Mécanisme abstrait de verre et de fluide lumineux, rendu macro 8k",
  },
];

function ImagesPage() {
  const navigate = useNavigate();
  const [images, setImages] = useState<GeneratedImage[]>(INITIAL_IMAGES);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_IMAGES[0].id);
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateImage = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspectRatio,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur de génération d'image");
      }

      const data = await res.json();
      if (data.imageUrl) {
        const newImg: GeneratedImage = {
          id: `img_${Date.now()}`,
          version: `V${images.length + 1}`,
          src: data.imageUrl,
          alt: prompt,
          prompt,
        };
        setImages([newImg, ...images]);
        setSelectedId(newImg.id);
        setPrompt("");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(e);
      setErrorMessage(msg || "Échec de génération d'image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedImage = images.find((i) => i.id === selectedId) || images[0];

  const animateInVeo = (img: GeneratedImage) => {
    navigate({
      to: "/creer",
    });
  };

  return (
    <AppShell title="Paris AI — Galerie Visuelle" centeredBrand>
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-surface-container"
          >
            <img
              src={lightboxImage.src}
              alt={lightboxImage.alt}
              className="max-h-[75vh] w-auto object-contain"
            />
            <div className="flex items-center justify-between p-4 bg-surface-container-high border-t border-white/10">
              <p className="text-xs text-on-surface truncate max-w-md">{lightboxImage.prompt}</p>
              <div className="flex gap-2">
                <a
                  href={lightboxImage.src}
                  download="paris-ai-image.png"
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-on-primary"
                >
                  Télécharger
                </a>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="rounded-lg bg-surface-variant px-3 py-1.5 text-xs text-on-surface"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1250px] flex-1 flex flex-col gap-6 p-gutter pb-24">
        {/* Header & Quick Generator */}
        <div className="glass-card flex flex-col gap-3 rounded-2xl border border-outline-variant/20 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MaterialIcon name="palette" className="text-primary text-2xl" />
              <h2 className="font-bold text-lg text-on-surface">Studio Images & Variations</h2>
            </div>
            <span className="text-xs text-on-surface-variant font-medium">
              Moteur : Gemini 3.1 Flash Image
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateImage()}
              placeholder="Décrivez l'image que vous souhaitez générer (ex: Portrait néon futuriste, Paris sous la neige 8k)..."
              className="flex-1 rounded-xl border border-outline-variant/30 bg-surface-container/60 px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            />

            <div className="flex items-center gap-2">
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as "1:1" | "16:9" | "9:16")}
                className="rounded-xl border border-outline-variant/30 bg-surface-container/80 px-3 py-2.5 text-xs font-medium text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="1:1">Carré (1:1)</option>
                <option value="16:9">Paysage (16:9)</option>
                <option value="9:16">Portrait (9:16)</option>
              </select>

              <button
                onClick={handleCreateImage}
                disabled={isGenerating || !prompt.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <MaterialIcon
                  name={isGenerating ? "hourglass_top" : "auto_awesome"}
                  className={`text-[18px] ${isGenerating ? "animate-spin" : ""}`}
                />
                <span>{isGenerating ? "Création..." : "Générer"}</span>
              </button>
            </div>
          </div>

          {errorMessage && <p className="text-xs text-error mt-1">{errorMessage}</p>}
        </div>

        {/* Gallery Grid & Main Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Main Large Spotlight */}
          <div className="md:col-span-7 flex flex-col gap-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container shadow-xl group">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-5">
                <p className="text-sm text-white/90 font-medium line-clamp-2 mb-3">
                  {selectedImage.prompt || selectedImage.alt}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLightboxImage(selectedImage)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md py-2 text-xs font-bold text-white hover:bg-white/30"
                  >
                    <MaterialIcon name="fullscreen" className="text-[18px]" />
                    Plein écran
                  </button>
                  <a
                    href={selectedImage.src}
                    download="paris-ai-image.png"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-on-primary shadow-lg hover:bg-primary-container"
                  >
                    <MaterialIcon name="download" className="text-[18px]" />
                    Télécharger
                  </a>
                  <button
                    onClick={() => animateInVeo(selectedImage)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-secondary py-2 text-xs font-bold text-white shadow-lg hover:bg-secondary/80"
                  >
                    <MaterialIcon name="videocam" className="text-[18px]" />
                    Animer (Veo 3)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Variations List */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">
              Toutes les variations ({images.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedId(img.id)}
                  className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border transition-all ${
                    selectedId === img.id
                      ? "border-primary ring-2 ring-primary/40 shadow-lg"
                      : "border-outline-variant/20 hover:border-primary/50"
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 rounded bg-black/60 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {img.version}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
