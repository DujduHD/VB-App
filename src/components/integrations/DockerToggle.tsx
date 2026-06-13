import { memo } from "react";
import { Container } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import { SectionHeader } from "../new-project/SectionHeader";
import { ToggleSwitch } from "../ui/ToggleSwitch";

export const DockerToggle = memo(function DockerToggle() {
  const { t } = useTranslation();
  const dockerEnabled = useProjectStore(
    (s) => s.form.integrations.dockerEnabled,
  );
  const setIntegrations = useProjectStore((s) => s.setIntegrations);

  return (
    <div>
      <SectionHeader icon={Container} title={t("form.integrationsExtended.dockerTitle")} />
      <label
        className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
          dockerEnabled
            ? "border-vb-accent/40 bg-vb-accent/5 dark:bg-vb-accent/10"
            : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-vb-border dark:bg-zinc-900 dark:hover:border-zinc-600"
        }`}
      >
        <div className="pr-4">
          <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t("form.integrationsExtended.dockerLabel")}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {t("form.integrationsExtended.dockerDesc")}
          </span>
        </div>
        <ToggleSwitch
          checked={dockerEnabled}
          onChange={(checked) => setIntegrations({ dockerEnabled: checked })}
        />
      </label>
      {dockerEnabled && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-vb-accent">
          <Container className="h-3 w-3" />
          {t("form.integrationsExtended.dockerNote")}
        </p>
      )}
    </div>
  );
});
