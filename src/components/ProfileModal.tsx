import { useState, useRef, useEffect } from "react";
import { MaterialIcon } from "./MaterialIcon";
import {
  useUserProfile,
  PRESET_AVATARS,
  deleteCustomAvatar,
  type PresetAvatar,
  type CustomAvatar,
} from "@/lib/user-store";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { profile, updateProfile, customAvatars, uploadCustomAvatar } = useUserProfile();
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [bio, setBio] = useState(profile.bio || "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setName(profile.name);
      setAvatar(profile.avatar);
      setBio(profile.bio || "");
      setSavedSuccess(false);
      setShowUrlInput(false);
      setCustomUrl("");
      setIsDragging(false);
    }
  }, [open, profile]);

  if (!open) return null;

  const handleSave = () => {
    const trimmedName = name.trim() || "Utilisateur";
    updateProfile({
      name: trimmedName,
      avatar,
      bio: bio.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleSelectPreset = (preset: PresetAvatar) => {
    setAvatar(preset.url);
  };

  const handleSelectCustom = (custom: CustomAvatar) => {
    setAvatar(custom.url);
  };

  const handleFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const cleanName = file.name.replace(/\.[^/.]+$/, "");
          uploadCustomAvatar(reader.result, cleanName);
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleFiles(files);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      uploadCustomAvatar(customUrl.trim(), "Photo importée");
      setAvatar(customUrl.trim());
      setShowUrlInput(false);
      setCustomUrl("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-[94vw] max-w-[520px] min-w-[300px] overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-high/95 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <MaterialIcon name="manage_accounts" className="text-xl" />
            </div>
            <div className="min-w-0">
              <h2 className="font-headline-lg-mobile text-base sm:text-lg font-bold text-on-surface truncate">
                Personnaliser mon profil
              </h2>
              <p className="text-[11px] sm:text-xs text-on-surface-variant truncate">
                Nom d'affichage et photo de profil (PFP)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-variant/40 transition-colors"
          >
            <MaterialIcon name="close" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1 no-scrollbar">
          {/* Live Preview */}
          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-primary shadow-md">
              <img
                src={avatar}
                alt="Aperçu photo de profil"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Changer l'image"
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100"
              >
                <MaterialIcon name="photo_camera" className="text-white text-base" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm sm:text-base font-bold text-on-surface">
                  {name.trim() || "Nom du profil"}
                </span>
                <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Actif
                </span>
              </div>
              <p className="truncate text-xs text-on-surface-variant">
                {bio.trim() || "Aucune biographie définie"}
              </p>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Nom d'affichage
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom ou pseudo..."
                maxLength={40}
                className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest/80 px-3.5 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="absolute right-3 text-[11px] text-on-surface-variant/50">
                {name.length}/40
              </span>
            </div>
          </div>

          {/* Direct Upload Banner with Drag and Drop */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-3 sm:p-4 text-center transition-all duration-200 ${
              isDragging
                ? "border-primary bg-primary/20 scale-[1.01] shadow-lg shadow-primary/20"
                : "border-primary/40 bg-primary/5 hover:border-primary/70 hover:bg-primary/10"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-left min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <MaterialIcon name="file_upload" className="text-2xl" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-on-surface">
                    Importer vos images officielles (sans IA)
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    Moxxie, McDo, etc. — Cliquez ou glissez vos fichiers ici
                  </p>
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-on-primary shadow-sm shadow-primary/25 transition-transform group-hover:scale-105 pointer-events-none">
                <MaterialIcon name="add_photo_alternate" className="text-[16px]" />
                <span>Sélectionner photos</span>
              </span>
            </div>
          </div>

          {/* Custom Uploaded Avatars */}
          {customAvatars.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <MaterialIcon name="verified" filled className="text-primary text-[14px]" />
                  Vos images officielles ({customAvatars.length})
                </label>
                <span className="text-[10px] text-on-surface-variant">
                  Sélectionnez pour appliquer
                </span>
              </div>
              <div className="grid grid-cols-2 min-[380px]:grid-cols-3 sm:grid-cols-4 gap-2.5">
                {customAvatars.map((custom) => {
                  const isSelected = avatar === custom.url;
                  return (
                    <div
                      key={custom.id}
                      className={`group relative flex flex-col items-center rounded-xl border p-2 transition-all duration-200 min-w-0 ${
                        isSelected
                          ? "border-primary bg-primary/15 shadow-sm shadow-primary/20 ring-2 ring-primary"
                          : "border-outline-variant/25 bg-surface-container/60 hover:border-primary/50 hover:bg-surface-container"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectCustom(custom)}
                        className="flex flex-col items-center w-full"
                      >
                        <div className="relative mb-1.5 h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-primary/40 shadow-sm">
                          <img
                            src={custom.url}
                            alt={custom.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-primary/40">
                              <MaterialIcon
                                name="check_circle"
                                filled
                                className="text-white text-lg"
                              />
                            </div>
                          )}
                        </div>
                        <span className="w-full truncate text-center text-[10px] font-semibold text-on-surface whitespace-nowrap block">
                          {custom.name}
                        </span>
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomAvatar(custom.id);
                        }}
                        title="Supprimer cette photo"
                        className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-error text-white shadow hover:scale-110 transition-transform"
                      >
                        <MaterialIcon name="close" className="text-[12px]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preset Avatars Grid */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Collection d'avatars suggérés ({PRESET_AVATARS.length})
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="flex items-center gap-1 text-[11px] font-medium text-on-surface-variant hover:text-primary transition-colors"
              >
                <MaterialIcon name="link" className="text-[14px]" />
                Lien URL
              </button>
            </div>

            <div className="grid grid-cols-2 min-[380px]:grid-cols-3 sm:grid-cols-4 gap-2">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = avatar === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    title={preset.description}
                    className={`group relative flex flex-col items-center rounded-xl border p-2 transition-all duration-200 min-w-0 ${
                      isSelected
                        ? "border-primary bg-primary/15 shadow-sm shadow-primary/20 ring-2 ring-primary"
                        : "border-outline-variant/25 bg-surface-container/60 hover:border-primary/50 hover:bg-surface-container"
                    }`}
                  >
                    <div className="relative mb-1 h-12 w-12 shrink-0 overflow-hidden rounded-full border border-outline-variant/30">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/40">
                          <MaterialIcon
                            name="check_circle"
                            filled
                            className="text-white text-base"
                          />
                        </div>
                      )}
                    </div>
                    <span className="w-full truncate text-center text-[10px] font-medium text-on-surface whitespace-nowrap block">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {showUrlInput && (
            <div className="flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-lowest/60 p-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://exemple.com/mon-avatar.jpg"
                className="flex-1 bg-transparent px-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary"
              >
                Appliquer
              </button>
            </div>
          )}

          {/* Bio Field */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Statut / Biographie
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ex: Créateur digital, fan d'animation..."
              maxLength={80}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest/80 px-3.5 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-outline-variant/15 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-md shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <MaterialIcon name={savedSuccess ? "check" : "save"} className="text-[16px]" />
            <span>{savedSuccess ? "Enregistré !" : "Enregistrer"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
