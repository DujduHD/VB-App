import type { LucideIcon } from "lucide-react";
import {
  KeyRound,
  GitBranch,
  Lock,
  LayoutGrid,
  ImagePlus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import type { ProjectHubMenu } from "../../types/projectsHub";
const menuItems: {
  id: ProjectHubMenu;
  icon: LucideIcon;
  labelKey: string;
}[] = [
  { id: "api", icon: KeyRound, labelKey: "projectsHub.menu.api" },
  { id: "cicd", icon: GitBranch, labelKey: "projectsHub.menu.cicd" },
  { id: "env", icon: Lock, labelKey: "projectsHub.menu.env" },
  { id: "vitrin", icon: LayoutGrid, labelKey: "projectsHub.menu.vitrin" },
  { id: "media", icon: ImagePlus, labelKey: "projectsHub.menu.media" },
];

export function ProjectHubSidebar() {
  const { t } = useTranslation();
  const selectedProject = useProjectStore((s) => s.selectedProject);
  const activeProjectMenu = useProjectStore((s) => s.activeProjectMenu);
  const setActiveProjectMenu = useProjectStore((s) => s.setActiveProjectMenu);

  const hasSelection = selectedProject !== null;

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/80 dark:border-vb-border dark:bg-zinc-950/50">
      <div className="border-b border-zinc-200 px-4 py-4 dark:border-vb-border">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t("projectsHub.sidebarTitle")}
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {hasSelection
            ? t("projectsHub.sidebarReady")
            : t("projectsHub.sidebarHint")}
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {menuItems.map(({ id, icon: Icon, labelKey }) => {
          const disabled = !hasSelection;
          const active = hasSelection && activeProjectMenu === id;

          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => setActiveProjectMenu(id)}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                active
                  ? "bg-vb-accent text-white shadow-sm shadow-vb-accent/20"
                  : disabled
                    ? "cursor-not-allowed text-zinc-400 dark:text-zinc-600"
                    : "text-zinc-700 hover:bg-white hover:shadow-sm dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t(labelKey)}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
