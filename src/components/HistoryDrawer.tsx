import { Link } from "@tanstack/react-router";
import { MaterialIcon } from "./MaterialIcon";
import { cn } from "@/lib/utils";

const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAQ0-u2m7ktYr33Iw6M3dicES8WnSGU9TUFrkvAEjxsoYJKAK-ICvsG-oeb0IIOzCq8ZtM-NJZHhneMYHO0Hk1HOWLmCvq1nlN-58r6-Y10UfZc6rUYzKiSP3OOJjpvMYmZD-tzeDsfmDWZnyiw9yYBWwOxqghCKrMBmGsHgJdJ_iz6a-vD2OEbdv5rOB83dCBc7OK9jLifygvxA57wynRt_jKmMGZCQKwsy-10riOsqPeohpYq-w";

const HISTORY: { label: string; items: string[] }[] = [
  { label: "Aujourd'hui", items: ["Projet marketing Q3", "Idées de voyage Japon"] },
  { label: "Hier", items: ["Code Python debug", "Recette de cuisine"] },
];

const itemClass =
  "w-full text-left flex items-center gap-sm rounded-lg px-md py-sm transition-colors duration-200 active:scale-95 truncate";

export function HistoryDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
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
          "fixed inset-y-0 left-0 z-50 flex h-full w-80 max-w-[85vw] flex-col rounded-r-xl border-r border-outline-variant/10 bg-surface-container-high/90 p-md backdrop-blur-xl transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-lg flex items-center justify-between gap-sm px-sm">
          <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary-fixed">
            Paris AI
          </span>
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="rounded-full p-1 text-on-surface-variant hover:bg-surface-variant/50"
          >
            <MaterialIcon name="close" />
          </button>
        </div>

        <div className="mb-lg space-y-sm">
          <Link
            to="/chat"
            onClick={onClose}
            className={cn(itemClass, "bg-primary-container text-on-primary-container")}
          >
            <MaterialIcon name="add" />
            <span className="font-label-md text-label-md">New Chat</span>
          </Link>
          <Link
            to="/creer"
            onClick={onClose}
            className={cn(itemClass, "text-on-surface-variant hover:bg-surface-variant/50")}
          >
            <MaterialIcon name="explore" />
            <span className="font-label-md text-label-md">Explore</span>
          </Link>
        </div>

        <div className="mb-lg flex-1 overflow-y-auto no-scrollbar">
          {HISTORY.map((group) => (
            <div key={group.label}>
              <div className="mb-xs mt-md px-sm first:mt-0">
                <span className="font-caption text-caption uppercase tracking-wider text-on-surface-variant/60">
                  {group.label}
                </span>
              </div>
              <ul className="space-y-base">
                {group.items.map((item) => (
                  <li key={item}>
                    <Link
                      to="/chat"
                      onClick={onClose}
                      className={cn(itemClass, "text-on-surface-variant hover:bg-surface-variant/50")}
                    >
                      <MaterialIcon
                        name="chat_bubble_outline"
                        className="text-outline"
                        style={{ fontSize: 18 }}
                      />
                      <span className="truncate font-body-md text-body-md">{item}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-outline-variant/20 pt-md">
          <Link
            to="/parametres"
            onClick={onClose}
            className={cn(itemClass, "mb-sm text-on-surface-variant hover:bg-surface-variant/50")}
          >
            <MaterialIcon name="settings" />
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
          <div className="flex cursor-pointer items-center gap-sm rounded-lg px-sm py-xs transition-colors hover:bg-surface-variant/30">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-outline-variant/30">
              <img src={AVATAR} alt="Photo de profil d'Alex Rivera" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate font-label-md text-label-md text-on-surface">Alex Rivera</span>
              <span className="flex items-center gap-1 truncate font-caption text-caption text-on-surface-variant/70">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" /> Premium Plan
                <span className="ml-2 text-outline-variant">v2.4</span>
              </span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
