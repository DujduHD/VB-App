import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Zap,
  Menu,
  Home,
  Bookmark,
  Settings,
  ChevronDown,
  FolderKanban,
} from "lucide-react";
import { useNavigationStore } from "../../stores/navigationStore";
import { useProjectStore } from "../../stores/projectStore";

export function AppHeader() {
  const { t } = useTranslation();
  const view = useNavigationStore((s) => s.view);
  const menuOpen = useNavigationStore((s) => s.menuOpen);
  const setView = useNavigationStore((s) => s.setView);
  const setMenuOpen = useNavigationStore((s) => s.setMenuOpen);
  const toggleMenu = useNavigationStore((s) => s.toggleMenu);
  const draftCount = useProjectStore((s) => s.drafts.length);
  const projectCount = useProjectStore((s) => s.timeCapsule.length);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { view: "home" as const, label: t("nav.home"), icon: Home },
    { view: "drafts" as const, label: t("nav.drafts"), icon: Bookmark },
    {
      view: "projects" as const,
      label: t("nav.projects"),
      icon: FolderKanban,
    },
    { view: "settings" as const, label: t("nav.settings"), icon: Settings },
  ];

  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen, setMenuOpen]);

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-zinc-200 px-6 py-4 dark:border-vb-border">
      <div className="justify-self-start">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
              menuOpen
                ? "border-vb-accent bg-vb-accent/10 text-vb-accent"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-vb-border dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            <Menu className="h-4 w-4" />
            <span className="hidden sm:inline">{t("nav.menu")}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl shadow-zinc-900/10 dark:border-vb-border dark:bg-zinc-900 dark:shadow-black/40"
            >
              {navItems.map(({ view: itemView, label, icon: Icon }) => {
                const active = view === itemView;
                const count =
                  itemView === "drafts"
                    ? draftCount
                    : itemView === "projects"
                      ? projectCount
                      : 0;

                return (
                  <button
                    key={itemView}
                    type="button"
                    role="menuitem"
                    onClick={() => setView(itemView)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? "bg-vb-accent/10 text-vb-accent"
                        : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 font-medium">{label}</span>
                    {count > 0 && (
                      <span className="rounded-full bg-vb-accent/15 px-2 py-0.5 text-[10px] font-semibold text-vb-accent">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 justify-self-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-vb-accent text-white">
          <Zap className="h-5 w-5" />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("app.name")}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("app.tagline")}
          </p>
        </div>
      </div>

      <div className="justify-self-end">
        <button
          type="button"
          data-tour="settings"
          onClick={() => setView("settings")}
          aria-label={t("nav.settings")}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
            view === "settings"
              ? "border-vb-accent bg-vb-accent/10 text-vb-accent"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-vb-accent dark:border-vb-border dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
          }`}
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
