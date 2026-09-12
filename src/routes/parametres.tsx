import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useUserProfile, PRESET_AVATARS, openProfileModal } from "@/lib/user-store";

export const Route = createFileRoute("/parametres")({
  head: () => ({
    meta: [
      { title: "Paramètres - Paris AI" },
      {
        name: "description",
        content:
          "Gérez votre profil, vos photos de profil, vos préférences et votre abonnement Paris AI.",
      },
      { property: "og:title", content: "Paramètres - Paris AI" },
      {
        property: "og:description",
        content:
          "Gérez votre profil, vos photos de profil, vos préférences et votre abonnement Paris AI.",
      },
    ],
  }),
  component: Parametres,
});

function Parametres() {
  const [darkMode, setDarkMode] = useState(true);
  const { profile, updateProfile, customAvatars, uploadCustomAvatar } = useUserProfile();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      updateProfile({ name: trimmed });
      showToast("Nom d'utilisateur mis à jour !");
    }
    setEditingName(false);
  };

  const handleSelectAvatar = (url: string, name: string) => {
    updateProfile({ avatar: url });
    showToast(`Photo de profil changée : ${name}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          uploadCustomAvatar(reader.result, file.name.replace(/\.[^/.]+$/, ""));
          showToast("Photo officielle importée et appliquée !");
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  return (
    <AppShell title="Paramètres">
      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-surface-container-highest px-4 py-2 text-xs font-semibold text-primary shadow-xl">
            <MaterialIcon name="check_circle" filled className="text-[16px]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-2xl flex-grow px-sm py-md pb-32">
        {/* Profile Section */}
        <section className="mb-lg">
          <div className="mb-sm flex items-center justify-between">
            <h2 className="font-label-md text-label-md uppercase tracking-widest text-primary">
              Mon Profil & Photo (PFP)
            </h2>
            <button
              onClick={openProfileModal}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <MaterialIcon name="tune" className="text-[14px]" />
              Personnaliser
            </button>
          </div>

          <div className="glass-card flex flex-col gap-4 rounded-xl p-md">
            {/* Main User Card Header */}
            <div className="flex items-center gap-md">
              <div className="relative group h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary/50 bg-surface-container-high shadow-md">
                <img
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  src={profile.avatar}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Importer votre photo originale"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MaterialIcon name="photo_camera" className="text-white text-xl" />
                </button>
              </div>

              <div className="flex-grow overflow-hidden min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") setEditingName(false);
                      }}
                      autoFocus
                      maxLength={40}
                      className="w-full rounded-lg border border-primary bg-surface-container-lowest px-3 py-1.5 text-base font-bold text-on-surface focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-on-primary"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-headline-lg-mobile text-lg font-bold text-on-surface">
                      {profile.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(profile.name);
                        setEditingName(true);
                      }}
                      title="Modifier mon nom"
                      className="rounded-full p-1 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <MaterialIcon name="edit" className="text-[16px]" />
                    </button>
                  </div>
                )}
                <p className="font-body-md text-xs text-on-surface-variant truncate">
                  {profile.email || "utilisateur@paris-ai.app"}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[11px] font-medium text-primary">
                    Profil actif • Membre Paris AI
                  </span>
                </div>
              </div>

              <button
                onClick={openProfileModal}
                className="hidden sm:flex items-center gap-1 rounded-xl border border-outline-variant/30 bg-surface-container-high px-3 py-2 text-xs font-medium text-on-surface hover:border-primary/50 transition-colors shrink-0"
              >
                <MaterialIcon name="edit" className="text-[14px]" />
                Modifier
              </button>
            </div>

            {/* Custom User Uploads (if any) */}
            {customAvatars.length > 0 && (
              <div className="border-t border-outline-variant/15 pt-3">
                <span className="mb-2 block text-xs font-semibold text-primary">
                  Vos photos importées ({customAvatars.length}) :
                </span>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
                  {customAvatars.map((custom) => {
                    const isSelected = profile.avatar === custom.url;
                    return (
                      <button
                        key={custom.id}
                        type="button"
                        onClick={() => handleSelectAvatar(custom.url, custom.name)}
                        className={`group relative flex flex-col items-center rounded-xl p-2 transition-all shrink-0 w-[72px] min-w-0 ${
                          isSelected
                            ? "bg-primary/20 ring-2 ring-primary scale-105"
                            : "bg-surface-container/50 hover:bg-surface-container hover:scale-102"
                        }`}
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-primary/40">
                          <img
                            src={custom.url}
                            alt={custom.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-primary/40">
                              <MaterialIcon
                                name="check"
                                filled
                                className="text-white text-base font-bold"
                              />
                            </div>
                          )}
                        </div>
                        <span className="mt-1 w-full truncate text-center text-[10px] font-medium text-on-surface-variant group-hover:text-on-surface whitespace-nowrap block">
                          {custom.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick PFP Selection Row */}
            <div className="border-t border-outline-variant/15 pt-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Photos de profil disponibles ({PRESET_AVATARS.length}) :
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20 transition-colors"
                >
                  <MaterialIcon name="upload" className="text-[14px]" />
                  Importer mes images (sans IA)
                </button>
              </div>

              {/* Responsive avatar row: always scrollable on mobile with min sizes, grid on large */}
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar sm:grid sm:grid-cols-7 sm:overflow-visible">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = profile.avatar === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectAvatar(preset.url, preset.name)}
                      title={preset.description}
                      className={`group relative flex flex-col items-center rounded-xl p-2 transition-all shrink-0 w-[72px] sm:w-auto min-w-0 ${
                        isSelected
                          ? "bg-primary/20 ring-2 ring-primary scale-105"
                          : "bg-surface-container/50 hover:bg-surface-container hover:scale-102"
                      }`}
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-outline-variant/30">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/40">
                            <MaterialIcon
                              name="check"
                              filled
                              className="text-white text-base font-bold"
                            />
                          </div>
                        )}
                      </div>
                      <span className="mt-1 w-full truncate text-center text-[10px] font-medium text-on-surface-variant group-hover:text-on-surface whitespace-nowrap block">
                        {preset.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
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
