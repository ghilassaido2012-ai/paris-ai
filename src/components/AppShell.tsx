import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { MaterialIcon } from "./MaterialIcon";
import { HistoryDrawer } from "./HistoryDrawer";
import { ProfileModal } from "./ProfileModal";
import { useUserProfile, useProfileModalControl } from "@/lib/user-store";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  title,
  centeredBrand = false,
  className,
  showAmbientGlow = false,
}: {
  children: ReactNode;
  title?: string;
  centeredBrand?: boolean;
  className?: string;
  showAmbientGlow?: boolean;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    isOpen: profileModalOpen,
    open: openProfileModal,
    close: closeProfileModal,
  } = useProfileModalControl();
  const { profile } = useUserProfile();

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col overflow-hidden bg-surface text-on-surface",
        className,
      )}
    >
      {showAmbientGlow && <div className="ambient-glow" />}
      <HistoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenProfile={openProfileModal}
      />
      <ProfileModal open={profileModalOpen} onClose={closeProfileModal} />

      <header className="sticky top-0 z-30 mx-auto flex h-16 w-full max-w-container-max flex-shrink-0 items-center justify-between border-b border-outline-variant/10 bg-surface/80 px-gutter backdrop-blur-md">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Ouvrir le menu"
          className="-ml-2 flex items-center justify-center rounded-full p-2 text-on-surface-variant transition-opacity hover:opacity-80 active:opacity-60"
        >
          <MaterialIcon name="menu" filled />
        </button>

        {centeredBrand ? (
          <Link to="/" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
            <MaterialIcon name="auto_awesome" filled className="text-2xl text-primary" />
            <span className="font-display-sm text-display-sm font-bold tracking-tighter text-primary">
              Paris AI
            </span>
          </Link>
        ) : (
          <Link
            to="/"
            className="font-display-sm text-display-sm font-bold tracking-tighter text-primary-fixed"
          >
            {title ?? "Paris AI"}
          </Link>
        )}

        <button
          type="button"
          onClick={openProfileModal}
          title={`Profil : ${profile.name} (Cliquez pour changer de nom et de photo)`}
          className="group relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-outline-variant/30 ring-2 ring-transparent transition-all hover:ring-primary/60 hover:scale-105 active:scale-95"
        >
          <img
            src={profile.avatar}
            alt={profile.name}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <span className="sr-only">Modifier mon profil</span>
        </button>
      </header>

      {children}
    </div>
  );
}
