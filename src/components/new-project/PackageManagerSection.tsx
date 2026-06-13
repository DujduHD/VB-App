import { memo } from "react";
import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import type { PackageManager } from "../../types/project";
import { SectionHeader } from "./SectionHeader";
import { ImportWarningSection } from "./ImportWarningSection";

const packageManagers: { value: PackageManager; label: string }[] = [
  { value: "npm", label: "npm" },
  { value: "yarn", label: "yarn" },
  { value: "pnpm", label: "pnpm" },
  { value: "bun", label: "bun" },
];

export const PackageManagerSection = memo(function PackageManagerSection() {
  const { t } = useTranslation();
  const packageManager = useProjectStore((s) => s.form.packageManager);
  const setPackageManager = useProjectStore((s) => s.setPackageManager);

  return (
    <ImportWarningSection fieldKey="packageManager">
      <SectionHeader icon={Package} title={t("form.packageManager.title")} />
      <div className="flex flex-wrap gap-2">
        {packageManagers.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setPackageManager(value)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
              packageManager === value
                ? "border-vb-accent bg-vb-accent text-white"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-vb-border dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </ImportWarningSection>
  );
});
