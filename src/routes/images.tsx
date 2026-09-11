import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";

export const Route = createFileRoute("/images")({
  head: () => ({
    meta: [
      { title: "Paris AI - Générateur d'Images" },
      {
        name: "description",
        content:
          "Générez 4 variations d'images à partir d'une description avec Paris AI, votre assistant de création visuelle.",
      },
      { property: "og:title", content: "Paris AI - Générateur d'Images" },
      {
        property: "og:description",
        content:
          "Générez 4 variations d'images à partir d'une description avec Paris AI, votre assistant de création visuelle.",
      },
    ],
  }),
  component: ImagesPage,
});

type GeneratedImage = {
  version: string;
  src: string;
  alt: string;
  selected?: boolean;
};

const IMAGES: GeneratedImage[] = [
  {
    version: "V1",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvAIVvyFVz6-SYVeRyP3c0oAnNi2o7Za5WZvnkL9FfGzQ1JVPMDU6Zo7CtlXinO3c7ITMi98Q98Wbddeihz89EpUq3erz9fxSv7km-znw7iNLcmHcobfiMO57quZ16A8rZzjdZvdeagPBrEs4f7ZgAYvNvXZop3dchSlLr8esrgvOgHMoQ0UVURkLfdnbKYO7K7uWl_DaTOe3WuTY5kk5OZOXiynMpQTHR9CDD3b-Fojw8yuzNXQ",
    alt: "Une peinture numérique moderne et abstraite d'une skyline futuriste de Paris au crépuscule, avec des bleus néon et des indigos profonds. Style cinématique avec des éléments glassmorphiques doux se fondant dans le ciel. Esthétique cyberpunk mêlée à l'impressionnisme classique. Ambiance sombre et feutrée avec des accents vibrants.",
  },
  {
    version: "V2",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnFoMXChw-xkXeM4cvGJax5T4OPthnq914R0XMrrpCh5iGHEwCQmOxm6nQRKHAp4hvBjVK99AVfxcoEP1QkuA7Hh4oMvUPGLlSjk4OIy-apDZonLsLiR8J96-KWMQEKgbkGSKS0aXZ_T6Nym8UJws2HUU7SaSUUrFIxy_tIIsN_1L7VzzDhf8ZzeBGwoBun5FxWkfA6gqbVeElykP9voZV6XZLaPv3tkeb4JZwrO8OlagKRdGTxQ",
    alt: "Un rendu 3D surréaliste et hyperréaliste d'une structure cristalline lumineuse flottant au-dessus d'un paysage sombre et minimal. Ombres profondes et éclairage à fort contraste créant une scène dramatique. Le cristal émet une luminescence violette et indigo douce se reflétant sur le sol noir poli. Esthétique science-fiction premium et luxueuse.",
  },
  {
    version: "V3",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9hSAtw0qBzOuOt-3jq2M1X21TzW_rTFG9BSsy2T-ds41I0UeRzHvRtty3awWLmfv-vTrAm02a-eAbMWgC-qKhEyEg0j--3xvnS-qcoTG8nR2Wbft7xXPA23B5eGJupQaLpfPmamLu1KCDw1l52b4ctgzKMwL74PQFF8Sig6HHzgnofjpbDa1Ia5_b4hwVHNXWxNUGJFeg2b4Kur17rR9-oxvTRuTmHYvE4kNvmyPrpYsMC_SNGw",
    alt: "Une illustration vectorielle élégante et minimaliste représentant une sphère lumineuse solitaire suspendue au-dessus de formes géométriques. Palette de couleurs restreinte aux bleus nuit profonds, gris ardoise et accents violet néon saisissants. Composition très équilibrée et architecturale incarnant un thème sombre 'Horizon Intelligent'.",
  },
  {
    version: "V4",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8Hd-79yWlUd62uvb0hU60hnmKiysa5SYudi9Egv3jA89fwAx7RAsKFH9XNdQOuxeVxAw7yLF9X-gIzbpjfgqD7o7IUzLNowAwxQcrprnQ7YYGh_8MMCj2hOW6d2PiSngspoC_-bxAP5qSejBiXO-kzoSJRWIDGzmWUiyLhnNRQtAJwKAVN2IRLqLJ-geeqd0UA0P0DGLRzy7dCe5hlJhRJdhiykyJ5RxNE_CCYP_7gs3D496fGA",
    alt: "Un rendu photographique macro d'un mécanisme abstrait de verre et de fluide, mêlant un liquide bleu marine profond à une réfraction lumineuse indigo lumineuse. Image très nette, haute définition, avec une faible profondeur de champ. Ambiance sombre, sophistiquée, évoquant le traitement physique de données par une intelligence artificielle.",
    selected: true,
  },
];

function ImageCard({ image }: { image: GeneratedImage }) {
  if (image.selected) {
    return (
      <div className="relative aspect-square rounded-xl overflow-hidden group border-2 border-primary shadow-[0_0_20px_rgba(128,131,255,0.15)] bg-surface-container">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={image.src}
          alt={image.alt}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,14,32,0.9)_0%,transparent_100%)] flex flex-col justify-end p-sm">
          <div className="flex justify-between items-center gap-xs">
            <button
              aria-label="Télécharger"
              className="flex-1 bg-primary/20 backdrop-blur-md rounded-lg py-xs flex justify-center items-center hover:bg-primary/30 transition-colors border border-primary/30 text-primary"
            >
              <MaterialIcon name="download" filled className="text-[20px]" />
            </button>
            <button
              aria-label="Améliorer (Upscale)"
              className="flex-1 bg-surface-container-highest/80 backdrop-blur-md rounded-lg py-xs flex justify-center items-center hover:bg-primary/20 transition-colors border border-white/5"
            >
              <MaterialIcon name="high_quality" className="text-on-surface text-[20px]" />
            </button>
            <button
              aria-label="Partager"
              className="flex-1 bg-surface-container-highest/80 backdrop-blur-md rounded-lg py-xs flex justify-center items-center hover:bg-primary/20 transition-colors border border-white/5"
            >
              <MaterialIcon name="share" className="text-on-surface text-[20px]" />
            </button>
          </div>
        </div>
        <div className="absolute top-xs left-xs bg-primary/20 backdrop-blur-md border border-primary/30 rounded px-2 py-0.5 flex items-center gap-1">
          <MaterialIcon name="check_circle" filled className="text-primary text-[12px]" />
          <span className="font-label-md text-label-md text-primary font-bold tracking-widest text-[10px]">
            {image.version}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-square rounded-xl overflow-hidden group border border-outline-variant/10 shadow-lg bg-surface-container">
      <img
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        src={image.src}
        alt={image.alt}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,14,32,0.9)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-sm">
        <div className="flex justify-between items-center gap-xs">
          <button
            aria-label="Télécharger"
            className="flex-1 bg-surface-container-highest/80 backdrop-blur-md rounded-lg py-xs flex justify-center items-center hover:bg-primary/20 transition-colors border border-white/5"
          >
            <MaterialIcon name="download" className="text-on-surface text-[20px]" />
          </button>
          <button
            aria-label="Améliorer (Upscale)"
            className="flex-1 bg-surface-container-highest/80 backdrop-blur-md rounded-lg py-xs flex justify-center items-center hover:bg-primary/20 transition-colors border border-white/5"
          >
            <MaterialIcon name="high_quality" className="text-on-surface text-[20px]" />
          </button>
          <button
            aria-label="Partager"
            className="flex-1 bg-surface-container-highest/80 backdrop-blur-md rounded-lg py-xs flex justify-center items-center hover:bg-primary/20 transition-colors border border-white/5"
          >
            <MaterialIcon name="share" className="text-on-surface text-[20px]" />
          </button>
        </div>
      </div>
      <div className="absolute top-xs left-xs bg-surface-container/60 backdrop-blur-md border border-white/10 rounded px-2 py-0.5">
        <span className="font-label-md text-label-md text-primary font-bold tracking-widest text-[10px]">
          {image.version}
        </span>
      </div>
    </div>
  );
}

function ImagesPage() {
  const [prompt, setPrompt] = useState("Un chaton cybernétique à Paris");

  return (
    <AppShell title="Paris AI" className="pb-safe">
      <main className="flex-1 flex flex-col px-sm py-md pb-[140px] max-w-[800px] mx-auto w-full gap-lg">
        <div className="flex flex-col gap-xs text-center">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            Générer une image
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            4 variations basées sur votre description
          </p>
        </div>

        <div className="grid grid-cols-2 gap-sm w-full">
          {IMAGES.map((image) => (
            <ImageCard key={image.version} image={image} />
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full z-40 bg-surface-container-lowest/90 backdrop-blur-2xl border-t border-outline-variant/10 pb-safe pb-[70px]">
        <div className="max-w-[800px] mx-auto px-sm py-sm">
          <div className="glass-card rounded-xl p-1 flex items-center gap-2 relative focus-within:ring-1 focus-within:ring-primary/50 transition-all">
            <button
              aria-label="Paramètres"
              className="p-3 text-on-surface-variant hover:text-primary transition-colors flex-shrink-0"
            >
              <MaterialIcon name="tune" />
            </button>
            <input
              className="flex-1 bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 font-body-lg text-body-lg h-12"
              placeholder="Décrivez l'image à générer..."
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button className="bg-[linear-gradient(135deg,var(--primary-container),var(--secondary-container))] rounded-lg px-4 h-11 flex items-center justify-center gap-2 mr-1 active:scale-95 transition-transform hover:shadow-[0_0_15px_rgba(128,131,255,0.4)]">
              <MaterialIcon name="draw" filled className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-sm py-xs pb-safe bg-surface-container-lowest/90 backdrop-blur-2xl border-t border-outline-variant/10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <button className="flex flex-col items-center justify-center text-on-surface-variant/60 p-xs hover:text-primary transition-all active:scale-90 duration-150">
          <MaterialIcon name="chat" className="mb-1" />
        </button>
        <button className="flex flex-col items-center justify-center bg-primary-container/20 text-primary rounded-full p-xs active:scale-90 duration-150">
          <MaterialIcon name="explore" filled className="mb-1" />
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant/60 p-xs hover:text-primary transition-all active:scale-90 duration-150">
          <MaterialIcon name="folder_open" className="mb-1" />
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant/60 p-xs hover:text-primary transition-all active:scale-90 duration-150">
          <MaterialIcon name="person" className="mb-1" />
        </button>
      </nav>
    </AppShell>
  );
}
