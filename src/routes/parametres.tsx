import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";

export const Route = createFileRoute("/parametres")({
  head: () => ({
    meta: [
      { title: "Paramètres - Paris AI" },
      {
        name: "description",
        content:
          "Gérez votre profil, vos préférences, la sécurité et votre abonnement Paris AI.",
      },
      { property: "og:title", content: "Paramètres - Paris AI" },
      {
        property: "og:description",
        content:
          "Gérez votre profil, vos préférences, la sécurité et votre abonnement Paris AI.",
      },
    ],
  }),
  component: Parametres,
});

const PROFILE_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBoZCkbrUHcfZyziO8sk_ZsOrvrYA0J2lW1RO7biOfR3ocNsI9D2nDP5-7At0TJ8TNWz3eSzFvu4G0-K5dsTugUISbmHS6jH7KA1GVfWlDUOtke7esGrhqzR65tf_Z4m_Yjnsnqr548wpmdBDtNkTqCobcNpaw2nZVZFIMwIP8W3uH4x0gDhhBdU600URTabfRWzf98uJ6BYdxGGG0Iud45lty3v3ykIo0-hZ7qyYUFAruB5b2apg";

function Parametres() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <AppShell title="Paramètres">
      <main className="mx-auto w-full max-w-2xl flex-grow px-sm py-md pb-32">
        {/* Profile Section */}
        <section className="mb-lg">
          <h2 className="mb-sm font-label-md text-label-md uppercase tracking-widest text-primary">
            Profil
          </h2>
          <div className="glass-card flex items-center gap-md rounded-xl p-md">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-outline-variant/30 bg-surface-container-high">
              <img
                className="h-full w-full object-cover"
                src={PROFILE_AVATAR}
                alt="Portrait en gros plan d'Alex Rivera, photo de profil de style studio sur fond sombre"
              />
            </div>
            <div className="flex-grow">
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                Alex Rivera
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                alex.rivera@example.com
              </p>
            </div>
            <button className="rounded-full p-2 text-primary transition-colors hover:bg-primary/10">
              <MaterialIcon name="edit" />
            </button>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="mb-lg">
          <h2 className="mb-sm font-label-md text-label-md uppercase tracking-widest text-primary">
            Préférences
          </h2>
          <div className="glass-card flex flex-col overflow-hidden rounded-xl">
            {/* Appearance Toggle */}
            <div className="flex items-center justify-between border-b border-outline-variant/10 p-md">
              <div className="flex items-center gap-sm">
                <MaterialIcon name="dark_mode" className="text-on-surface-variant" />
                <span className="font-body-md text-body-md text-on-surface">Mode Sombre</span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="peer sr-only"
                  type="checkbox"
                />
                <div className="peer h-6 w-11 rounded-full bg-surface-container-highest after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
              </label>
            </div>
            {/* Language Selection */}
            <div className="flex items-center justify-between p-md">
              <div className="flex items-center gap-sm">
                <MaterialIcon name="language" className="text-on-surface-variant" />
                <span className="font-body-md text-body-md text-on-surface">Langue</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="font-body-md text-body-md">Français</span>
                <MaterialIcon name="chevron_right" className="text-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="mb-lg">
          <h2 className="mb-sm font-label-md text-label-md uppercase tracking-widest text-primary">
            Sécurité
          </h2>
          <div className="glass-card flex flex-col overflow-hidden rounded-xl">
            <div className="flex cursor-pointer items-center justify-between border-b border-outline-variant/10 p-md transition-colors hover:bg-surface-variant/30">
              <div className="flex items-center gap-sm">
                <MaterialIcon name="lock" className="text-on-surface-variant" />
                <span className="font-body-md text-body-md text-on-surface">Mot de passe</span>
              </div>
              <MaterialIcon name="chevron_right" className="text-on-surface-variant" />
            </div>
            <div className="flex cursor-pointer items-center justify-between p-md transition-colors hover:bg-surface-variant/30">
              <div className="flex items-center gap-sm">
                <MaterialIcon name="verified_user" className="text-on-surface-variant" />
                <span className="font-body-md text-body-md text-on-surface">
                  Authentification 2FA
                </span>
              </div>
              <MaterialIcon name="chevron_right" className="text-on-surface-variant" />
            </div>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="mb-xl">
          <h2 className="mb-sm font-label-md text-label-md uppercase tracking-widest text-primary">
            Abonnement
          </h2>
          <div className="glass-card relative overflow-hidden rounded-xl p-md">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative z-10 mb-sm flex items-start justify-between">
              <div>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile font-semibold text-on-surface">
                  Premium
                </h3>
                <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
                  Accès complet à Paris AI
                </p>
              </div>
              <span className="rounded-full border border-primary/30 bg-primary/20 px-3 py-1 font-label-md text-label-md text-xs uppercase tracking-wider text-primary">
                Actif
              </span>
            </div>
            <button className="relative z-10 mt-md w-full rounded-lg border border-outline-variant bg-transparent py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-variant/50">
              Gérer l'abonnement
            </button>
          </div>
        </section>

        {/* Logout Button */}
        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-error/20 bg-error-container/10 py-4 text-error transition-colors hover:bg-error-container/20 active:scale-95">
          <MaterialIcon name="logout" />
          <span className="font-label-md text-label-md font-semibold">Se déconnecter</span>
        </button>
      </main>
    </AppShell>
  );
}
