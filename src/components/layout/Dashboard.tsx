import { ToastContainer } from "../ui/ToastContainer";
import { TimeCapsule } from "../time-capsule/TimeCapsule";
import { NewProjectForm } from "../new-project/NewProjectForm";
import { DraftsPage } from "../drafts/DraftsPage";
import { ProjectsDashboard } from "../projects/ProjectsDashboard";
import { SettingsPage } from "../settings/SettingsPage";
import { LogPanel } from "../ui/LogPanel";
import { AppHeader } from "./AppHeader";
import { OnboardingTour } from "../onboarding/OnboardingTour";
import { useDensity } from "../../hooks/useDensity";
import { useInitApp } from "../../hooks/useInitApp";
import { useNavigationStore } from "../../stores/navigationStore";

export function Dashboard() {
  useInitApp();
  const view = useNavigationStore((s) => s.view);
  const { pagePadding, sidebarPadding } = useDensity();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <main className="flex flex-1 gap-0 overflow-hidden">
        {view === "home" && (
          <>
            <aside className="flex w-[380px] shrink-0 flex-col overflow-hidden border-r border-zinc-200 dark:border-vb-border">
              <div className={`flex-1 overflow-y-auto ${sidebarPadding}`}>
                <TimeCapsule />
              </div>
              <div data-tour="log-panel">
                <LogPanel />
              </div>
            </aside>

            <div className={`flex-1 overflow-y-auto ${pagePadding}`}>
              <div className="mx-auto max-w-xl">
                <NewProjectForm />
              </div>
            </div>
          </>
        )}

        {view === "drafts" && (
          <div className="flex-1 overflow-y-auto p-6 lg:p-10">
            <DraftsPage />
          </div>
        )}

        {view === "projects" && <ProjectsDashboard />}

        {view === "settings" && (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <SettingsPage />
          </div>
        )}
      </main>

      <ToastContainer />
      <OnboardingTour />
    </div>
  );
}
