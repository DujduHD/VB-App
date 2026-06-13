import { useTranslation } from "react-i18next";
import { useDensity } from "../../hooks/useDensity";
import { useProjectStore } from "../../stores/projectStore";
import { IdentitySection } from "./IdentitySection";
import { PlatformSection } from "./PlatformSection";
import { FrameworkSection } from "./FrameworkSection";
import { PackageManagerSection } from "./PackageManagerSection";
import { IntegrationsSection } from "./IntegrationsSection";
import { LaunchSection } from "./LaunchSection";
import { FormFooter } from "./FormFooter";
import { VibeSection } from "../vibe/VibeSection";
import { DependencyModal } from "../ui/DependencyModal";
import { ExternalImportAlert } from "./ExternalImportAlert";

export function NewProjectForm() {
  const { t } = useTranslation();
  const submitProject = useProjectStore((s) => s.submitProject);
  const { sectionGap, compact } = useDensity();

  return (
    <section className="flex h-full flex-col" data-tour="new-project-form">
      <header className={compact ? "mb-4" : "mb-6"}>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {t("form.title")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("form.subtitle")}
        </p>
      </header>

      <form
        className={`flex flex-1 flex-col overflow-y-auto pr-1 ${sectionGap}`}
        onSubmit={(e) => {
          e.preventDefault();
          submitProject();
        }}
      >
        <ExternalImportAlert />
        <IdentitySection />
        <PlatformSection />
        <FrameworkSection />
        <PackageManagerSection />
        <VibeSection />
        <IntegrationsSection />
        <LaunchSection />
        <FormFooter />
      </form>
      <DependencyModal />
    </section>
  );
}
