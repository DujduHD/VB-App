import { ArrowLeft, FolderOpen, Sparkles, Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import {
  selectedProjectName,
  selectedProjectPath,
  selectedProjectHasDiskPath,
  selectedProjectPackageManager,
} from "../../types/projectsHub";
import {
  frameworkLabels,
  getCodeEditorLabel,
  platformLabels,
} from "../../utils/projectLabels";
import { normalizeFramework } from "../../constants/platforms";
import type { PackageManager } from "../../types/project";
import { ProjectHubMenuPanel } from "./ProjectHubMenuPanel";

export function ProjectHubDetail() {
  const { t } = useTranslation();
  const selectedProject = useProjectStore((s) => s.selectedProject);
  const activeProjectMenu = useProjectStore((s) => s.activeProjectMenu);
  const clearSelectedProject = useProjectStore((s) => s.clearSelectedProject);

  if (!selectedProject) return null;

  const name = selectedProjectName(selectedProject);
  const path = selectedProjectPath(selectedProject);
  const hasDiskPath = selectedProjectHasDiskPath(selectedProject);
  const isCapsule = selectedProject.kind === "capsule";

  const framework = normalizeFramework(
    isCapsule
      ? selectedProject.project.framework
      : selectedProject.draft.form.framework,
  );
  const platform = isCapsule
    ? selectedProject.project.platform ?? "web"
    : selectedProject.draft.form.platform;
  const packageManager = selectedProjectPackageManager(
    selectedProject,
  ) as PackageManager;

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="mb-6 flex items-start gap-4">
        <button
          type="button"
          onClick={clearSelectedProject}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-vb-accent hover:text-vb-accent dark:border-vb-border dark:bg-zinc-900 dark:text-zinc-300"
          aria-label={t("projectsHub.backToList")}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isCapsule ? (
              <Sparkles className="h-4 w-4 text-vb-accent" />
            ) : (
              <Bookmark className="h-4 w-4 text-amber-500" />
            )}
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {isCapsule
                ? t("projectsHub.capsuleBadge")
                : t("projectsHub.draftBadge")}
            </span>
          </div>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
              {frameworkLabels[framework] ?? framework}
            </span>
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
              {platformLabels[platform]}
            </span>
            {isCapsule && (
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                {getCodeEditorLabel(selectedProject.project.aiTool)}
              </span>
            )}
          </div>
          {path ? (
            <p className="mt-3 flex items-center gap-1.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
              <FolderOpen className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{path}</span>
            </p>
          ) : (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
              {t("projectsHub.noDiskPath")}
            </p>
          )}
        </div>
      </div>

      <ProjectHubMenuPanel
        menu={activeProjectMenu}
        hasDiskPath={hasDiskPath}
        projectPath={path}
        framework={framework}
        packageManager={packageManager}
        selectedProject={selectedProject}
      />
    </div>
  );
}
