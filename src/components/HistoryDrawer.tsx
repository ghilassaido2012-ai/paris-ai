import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MaterialIcon } from "./MaterialIcon";
import { cn } from "@/lib/utils";
import {
  loadConversations,
  setActiveConversationId,
  createNewConversation,
  type Conversation,
} from "@/lib/chat-store";
import { useUserProfile } from "@/lib/user-store";

const itemClass =
  "w-full text-left flex items-center gap-sm rounded-lg px-md py-sm transition-colors duration-200 active:scale-95 truncate";

export function HistoryDrawer({
  open,
  onClose,
  onOpenProfile,
}: {
  open: boolean;
  onClose: () => void;
  onOpenProfile?: () => void;
}) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { profile } = useUserProfile();

  useEffect(() => {
    if (open) {
      setConversations(loadConversations());
    }
  }, [open]);

  const handleSelectConv = (id: string) => {
    setActiveConversationId(id);
    onClose();
    navigate({ to: "/chat" });
  };

  const handleNewChat = () => {
    const newC = createNewConversation();
    setActiveConversationId(newC.id);
    onClose();
    navigate({ to: "/chat" });
  };

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-background/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <nav
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-80 max-w-[85vw] flex-col rounded-r-xl border-r border-outline-variant/10 bg-surface-container-high/95 p-md backdrop-blur-xl transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-lg flex items-center justify-between gap-sm px-sm">
          <Link to="/" onClick={onClose} className="flex items-center gap-2">
            <MaterialIcon name="auto_awesome" filled className="text-primary text-xl" />
            <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary-fixed">
              Paris AI
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="rounded-full p-1 text-on-surface-variant hover:bg-surface-variant/50"
          >
            <MaterialIcon name="close" />
          </button>
        </div>

        {/* Navigation Shortcuts */}
        <div className="mb-md space-y-1">
          <button
            onClick={handleNewChat}
            className={cn(
              itemClass,
              "bg-primary-container text-on-primary-container font-semibold",
            )}
          >
            <MaterialIcon name="add" />
            <span className="font-label-md text-label-md">Nouvelle discussion</span>
          </button>
          <Link
            to="/creer"
            onClick={onClose}
            className={cn(itemClass, "text-on-surface-variant hover:bg-surface-variant/50")}
          >
            <MaterialIcon name="videocam" />
            <span className="font-label-md text-label-md">Studio Vidéo (Veo 3) & Image</span>
          </Link>
          <Link
            to="/images"
            onClick={onClose}
            className={cn(itemClass, "text-on-surface-variant hover:bg-surface-variant/50")}
          >
            <MaterialIcon name="palette" />
            <span className="font-label-md text-label-md">Galerie Images</span>
          </Link>
          <Link
            to="/analyse"
            onClick={onClose}
            className={cn(itemClass, "text-on-surface-variant hover:bg-surface-variant/50")}
          >
            <MaterialIcon name="analytics" />
            <span className="font-label-md text-label-md">Analyse Documentaire</span>
          </Link>
        </div>

        {/* Real Conversation History */}
        <div className="mb-lg flex-1 overflow-y-auto no-scrollbar">
          <div className="mb-xs mt-2 px-sm">
            <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant/60">
              Historique des discussions ({conversations.length})
            </span>
          </div>

          <ul className="space-y-1">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => handleSelectConv(c.id)}
                  className={cn(
                    itemClass,
                    "text-on-surface-variant hover:bg-surface-variant/50 text-xs",
                  )}
                >
                  <MaterialIcon
                    name="chat_bubble_outline"
                    className="text-outline shrink-0 text-[16px]"
                  />
                  <span className="truncate">{c.title || "Discussion"}</span>
                </button>
              </li>
            ))}
            {conversations.length === 0 && (
              <li className="px-3 py-2 text-xs text-on-surface-variant/50 italic">
                Aucune conversation enregistrée.
              </li>
            )}
          </ul>
        </div>

        {/* User Footer */}
        <div className="mt-auto border-t border-outline-variant/20 pt-md">
          <Link
            to="/parametres"
            onClick={onClose}
            className={cn(itemClass, "mb-sm text-on-surface-variant hover:bg-surface-variant/50")}
          >
            <MaterialIcon name="settings" />
            <span className="font-label-md text-label-md">Paramètres</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenProfile) {
                onOpenProfile();
              } else {
                navigate({ to: "/parametres" });
              }
            }}
            title="Modifier votre nom et photo de profil"
            className="flex w-full items-center gap-sm rounded-lg p-1.5 text-left transition-colors hover:bg-surface-variant/40 group"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-primary/40 ring-2 ring-primary/20 transition-transform group-hover:scale-105">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col overflow-hidden flex-1">
              <div className="flex items-center justify-between">
                <span className="truncate font-label-md text-sm font-bold text-on-surface">
                  {profile.name}
                </span>
                <MaterialIcon
                  name="edit"
                  className="text-primary opacity-0 group-hover:opacity-100 text-[14px] transition-opacity"
                />
              </div>
              <span className="flex items-center gap-1 truncate text-[11px] text-primary">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" /> Gemini 3.5 & Veo 3
              </span>
            </div>
          </button>
        </div>
      </nav>
    </>
  );
}
