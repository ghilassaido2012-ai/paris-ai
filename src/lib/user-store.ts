import { useState, useEffect } from "react";

export interface PresetAvatar {
  id: string;
  name: string;
  description: string;
  url: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: "moxxie-minecraft",
    name: "Moxxie Minecraft 😔",
    description: "Moxxie en détresse devant la lave avec son casque en diamant",
    url: "/avatars/moxxie-minecraft.jpg",
  },
  {
    id: "cat-demon-white",
    name: "Démone Chat Blanche",
    description: "Combinaison féline blanche, visage carmin et pentagramme",
    url: "/avatars/cat-demon-white.jpg",
  },
  {
    id: "dark-crown",
    name: "Couronne des Ombres",
    description: "Silhouette voilée mystique et couronne d'épines sombre",
    url: "/avatars/dark-crown.jpg",
  },
  {
    id: "thats-la-peace",
    name: "That's La Peace ☮️",
    description: "Le sage serein devant le coucher de soleil doré",
    url: "/avatars/thats-la-peace.jpg",
  },
  {
    id: "blitzo-derp",
    name: "Blitzø Déjanté 🤪",
    description: "Blitzø avec sa tête penchée et son expression hilarante",
    url: "/avatars/blitzo-derp.jpg",
  },
  {
    id: "fast-food-shift",
    name: "Octavia McDo Fatigue 🍟",
    description: "Casquette dorée, micro-casque et fatigue intense au drive",
    url: "/avatars/fast-food-shift.jpg",
  },
  {
    id: "tuxedo-cat-demon",
    name: "Démon en Smoking 🎩",
    description: "Chat démon élégant en costume noir et nœud papillon rouge",
    url: "/avatars/tuxedo-cat-demon.jpg",
  },
];

export interface UserProfile {
  name: string;
  avatar: string;
  bio?: string;
  email?: string;
}

export interface CustomAvatar {
  id: string;
  name: string;
  url: string;
  createdAt: number;
}

const STORAGE_KEY = "paris_ai_user_profile";
const CUSTOM_AVATARS_KEY = "paris_ai_custom_avatars";
const PROFILE_EVENT = "paris_ai_profile_updated";
const PROFILE_MODAL_EVENT = "paris_ai_open_profile_modal";

export const DEFAULT_PROFILE: UserProfile = {
  name: "Ghilas",
  avatar: "/avatars/moxxie-minecraft.jpg",
  bio: "Utilisateur passionné de Paris AI & création multimodale",
  email: "utilisateur@paris-ai.app",
};

export function loadUserProfile(): UserProfile {
  if (typeof window === "undefined") {
    return DEFAULT_PROFILE;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name?.trim() || DEFAULT_PROFILE.name,
      avatar: parsed.avatar || DEFAULT_PROFILE.avatar,
      bio: parsed.bio ?? DEFAULT_PROFILE.bio,
      email: parsed.email ?? DEFAULT_PROFILE.email,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: Partial<UserProfile>): UserProfile {
  const current = loadUserProfile();
  const updated: UserProfile = {
    ...current,
    ...profile,
    name: profile.name !== undefined ? profile.name.trim() : current.name,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: updated }));
  } catch (err) {
    console.warn("Could not persist user profile:", err);
  }

  return updated;
}

export function loadCustomAvatars(): CustomAvatar[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_AVATARS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addCustomAvatar(url: string, name?: string): CustomAvatar {
  const list = loadCustomAvatars();
  const newAvatar: CustomAvatar = {
    id: `custom-${Date.now()}`,
    name: name || `Photo importée #${list.length + 1}`,
    url,
    createdAt: Date.now(),
  };
  const updated = [newAvatar, ...list.filter((a) => a.url !== url)].slice(0, 20);
  try {
    localStorage.setItem(CUSTOM_AVATARS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("paris_ai_custom_avatars_updated"));
  } catch (err) {
    console.warn("Could not save custom avatar:", err);
  }
  return newAvatar;
}

export function deleteCustomAvatar(id: string) {
  const list = loadCustomAvatars();
  const updated = list.filter((a) => a.id !== id);
  try {
    localStorage.setItem(CUSTOM_AVATARS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("paris_ai_custom_avatars_updated"));
  } catch (err) {
    console.warn("Could not delete custom avatar:", err);
  }
}

export function openProfileModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PROFILE_MODAL_EVENT));
  }
}

export function useProfileModalControl() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener(PROFILE_MODAL_EVENT, handler);
    return () => window.removeEventListener(PROFILE_MODAL_EVENT, handler);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [customAvatars, setCustomAvatars] = useState<CustomAvatar[]>([]);

  useEffect(() => {
    setProfile(loadUserProfile());
    setCustomAvatars(loadCustomAvatars());

    const handleUpdate = () => {
      setProfile(loadUserProfile());
    };

    const handleCustomUpdate = () => {
      setCustomAvatars(loadCustomAvatars());
    };

    window.addEventListener(PROFILE_EVENT, handleUpdate);
    window.addEventListener("paris_ai_custom_avatars_updated", handleCustomUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(PROFILE_EVENT, handleUpdate);
      window.removeEventListener("paris_ai_custom_avatars_updated", handleCustomUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    const saved = saveUserProfile(updates);
    setProfile(saved);
    return saved;
  };

  const uploadCustomAvatar = (dataUrl: string, name?: string) => {
    const added = addCustomAvatar(dataUrl, name);
    setCustomAvatars(loadCustomAvatars());
    updateProfile({ avatar: dataUrl });
    return added;
  };

  return { profile, updateProfile, customAvatars, uploadCustomAvatar };
}
