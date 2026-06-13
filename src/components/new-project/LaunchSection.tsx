import { Rocket, GitBranch, Cloud } from "lucide-react";
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import { deployTargetOptions } from "../../constants/deployTargets";
import { supportsWebDeploy } from "../../constants/platforms";
import {
  getDeployDescription,
  getDeployLabel,
} from "../../utils/deployLabels";
import { SelectionCard } from "../ui/SelectionCard";
import { ToggleSwitch } from "../ui/ToggleSwitch";
import { SectionHeader } from "./SectionHeader";
import { ImportWarningSection } from "./ImportWarningSection";
import { PromptPreviewButton } from "../vibe/PromptPreviewButton";

export const LaunchSection = memo(function LaunchSection() {
  const { t } = useTranslation();
  const deployTarget = useProjectStore((s) => s.form.launch.deployTarget);
  const gitEnabled = useProjectStore((s) => s.form.launch.gitEnabled);
  const openGithub = useProjectStore((s) => s.form.launch.openGithub);
  const platform = useProjectStore((s) => s.form.platform);
  const framework = useProjectStore((s) => s.form.framework);
  const setLaunch = useProjectStore((s) => s.setLaunch);

  const deploySupported = supportsWebDeploy(framework);

  const visibleDeployTargets = useMemo(
    () =>
      deploySupported
        ? deployTargetOptions
        : deployTargetOptions.filter((target) => target.value === "none"),
    [deploySupported],
  );

  return (
    <div className="space-y-6">
      <ImportWarningSection fieldKey="deployTarget">
        <SectionHeader icon={Cloud} title={t("form.launch.deployTarget")} />
        <div className="max-h-72 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2">
            {visibleDeployTargets.map(({ value, configFile }) => (
              <SelectionCard
                key={value}
                title={getDeployLabel(value)}
                description={getDeployDescription(value)}
                badge={configFile}
                descriptionSize="2xs"
                isSelected={deployTarget === value}
                onClick={() => setLaunch({ deployTarget: value })}
              />
            ))}
          </div>
        </div>
        {!deploySupported && (
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {platform === "mobile"
              ? t("form.launch.noWebDeployMobile")
              : t("form.launch.noWebDeployDesktop")}
          </p>
        )}
      </ImportWarningSection>

      <div>
        <SectionHeader icon={GitBranch} title={t("form.launch.gitSectionTitle")} />
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-vb-border dark:bg-zinc-900">
            <div>
              <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {t("form.launch.gitAutomation")}
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                {t("form.launch.gitAutomationDesc")}
              </span>
            </div>
            <ToggleSwitch
              checked={gitEnabled}
              onChange={(checked) => setLaunch({ gitEnabled: checked })}
            />
          </label>

          <label
            className={`flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-vb-border dark:bg-zinc-900 ${
              !gitEnabled ? "opacity-50" : ""
            }`}
          >
            <div>
              <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {t("form.launch.openGithubTab")}
              </span>
              <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                {t("form.launch.openGithubDesc")}
              </span>
            </div>
            <ToggleSwitch
              checked={openGithub}
              disabled={!gitEnabled}
              onChange={(checked) => setLaunch({ openGithub: checked })}
            />
          </label>
        </div>
      </div>

      <PromptPreviewButton />

      <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <Rocket className="h-3 w-3" />
        {t("form.launch.afterLaunchNote")}
      </p>
    </div>
  );
});
