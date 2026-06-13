import { memo, useMemo } from "react";
import { Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import {
  frameworkMeta,
  frameworksByPlatform,
} from "../../constants/platforms";
import { SelectionCard } from "../ui/SelectionCard";
import { SectionHeader } from "./SectionHeader";
import { ImportWarningSection } from "./ImportWarningSection";

export const FrameworkSection = memo(function FrameworkSection() {
  const { t } = useTranslation();
  const platform = useProjectStore((s) => s.form.platform);
  const framework = useProjectStore((s) => s.form.framework);
  const setFramework = useProjectStore((s) => s.setFramework);

  const availableFrameworks = useMemo(
    () =>
      frameworksByPlatform[platform].map((value) => ({
        value,
        ...frameworkMeta[value],
      })),
    [platform],
  );

  return (
    <ImportWarningSection fieldKey="framework">
      <SectionHeader icon={Layers} title={t("form.framework.selectTitle")} />
      <div
        className={`max-h-64 overflow-y-auto pr-1 grid gap-2 ${
          availableFrameworks.length > 2 ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        {availableFrameworks.map(({ value, label, desc }) => (
          <SelectionCard
            key={value}
            title={label}
            description={desc}
            isSelected={framework === value}
            onClick={() => setFramework(value)}
          />
        ))}
      </div>
    </ImportWarningSection>
  );
});
