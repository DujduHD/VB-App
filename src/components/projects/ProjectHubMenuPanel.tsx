import { useTranslation } from "react-i18next";
import type { Framework, PackageManager } from "../../types/project";
import type { ProjectHubMenu, SelectedProject } from "../../types/projectsHub";
import { ApiInjectPanel } from "./ApiInjectPanel";
import { CicdPanel } from "./CicdPanel";
import { EnvVaultPanel } from "./EnvVaultPanel";
import { MediaAssetPanel } from "./MediaAssetPanel";
import { VitrinPanel } from "./VitrinPanel";

const panelKeys: Record<ProjectHubMenu, string> = {
  api: "projectsHub.panels.api",
  cicd: "projectsHub.panels.cicd",
  env: "projectsHub.panels.env",
  vitrin: "projectsHub.panels.vitrin",
  media: "projectsHub.panels.media",
};

const menuTitleKeys: Record<ProjectHubMenu, string> = {
  api: "projectsHub.menu.api",
  cicd: "projectsHub.menu.cicd",
  env: "projectsHub.menu.env",
  vitrin: "projectsHub.menu.vitrin",
  media: "projectsHub.menu.media",
};

export function ProjectHubMenuPanel({
  menu,
  hasDiskPath,
  projectPath,
  framework,
  packageManager,
  selectedProject,
}: {
  menu: ProjectHubMenu;
  hasDiskPath: boolean;
  projectPath: string | null;
  framework: Framework;
  packageManager: PackageManager;
  selectedProject: SelectedProject;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-vb-border dark:bg-vb-surface">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {t(menuTitleKeys[menu])}
      </h3>

      {menu !== "vitrin" &&
        menu !== "media" &&
        menu !== "api" &&
        menu !== "cicd" &&
        menu !== "env" && (
          <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {t(panelKeys[menu])}
          </p>
        )}

      {menu === "env" && (
        <div className="mt-4">
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            {t(panelKeys.env)}
          </p>
          <EnvVaultPanel />
        </div>
      )}

      {menu === "vitrin" && selectedProject && (
        <div>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t(panelKeys.vitrin)}
          </p>
          <VitrinPanel selected={selectedProject} />
        </div>
      )}

      {menu === "cicd" && (
        <div className="mt-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t(panelKeys.cicd)}
          </p>
          {!hasDiskPath || !projectPath ? (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              {t("projectsHub.diskPathRequired")}
            </p>
          ) : (
            <CicdPanel
              projectPath={projectPath}
              framework={framework}
              packageManager={packageManager}
            />
          )}
        </div>
      )}

      {menu === "api" && (
        <div className="mt-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t(panelKeys.api)}
          </p>
          {!hasDiskPath || !projectPath ? (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              {t("projectsHub.diskPathRequired")}
            </p>
          ) : (
            <ApiInjectPanel projectPath={projectPath} />
          )}
        </div>
      )}

      {menu === "media" && (
        <div className="mt-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t(panelKeys.media)}
          </p>
          {!hasDiskPath || !projectPath ? (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              {t("projectsHub.diskPathRequired")}
            </p>
          ) : (
            <MediaAssetPanel projectPath={projectPath} framework={framework} />
          )}
        </div>
      )}
    </div>
  );
}
