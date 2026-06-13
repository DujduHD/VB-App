import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import { ProjectHubSidebar } from "./ProjectHubSidebar";
import { ProjectPickerList } from "./ProjectPickerList";
import { ProjectHubDetail } from "./ProjectHubDetail";

export function ProjectsDashboard() {
  const { t } = useTranslation();
  const selectedProject = useProjectStore((s) => s.selectedProject);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <ProjectHubSidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="border-b border-zinc-200 px-6 py-5 dark:border-vb-border">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t("projectsHub.title")}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t("projectsHub.subtitle")}
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {selectedProject ? <ProjectHubDetail /> : <ProjectPickerList />}
        </div>
      </div>
    </div>
  );
}
