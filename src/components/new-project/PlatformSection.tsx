import { memo } from "react";
import { Monitor, Globe, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import type { AppPlatform } from "../../types/project";
import { platformOptions } from "../../constants/platforms";
import { SelectionCard } from "../ui/SelectionCard";
import { SectionHeader } from "./SectionHeader";
import { ImportWarningSection } from "./ImportWarningSection";

const platformIcons: Record<AppPlatform, LucideIcon> = {
  web: Globe,
  desktop: Monitor,
  mobile: Smartphone,
};

const platformLabelKeys: Record<AppPlatform, string> = {
  web: "form.platform.web",
  desktop: "form.platform.desktop",
  mobile: "form.platform.mobile",
};

const platformDescKeys: Record<AppPlatform, string> = {
  web: "form.platform.webDesc",
  desktop: "form.platform.desktopDesc",
  mobile: "form.platform.mobileDesc",
};

export const PlatformSection = memo(function PlatformSection() {
  const { t } = useTranslation();
  const platform = useProjectStore((s) => s.form.platform);
  const setPlatform = useProjectStore((s) => s.setPlatform);

  return (
    <ImportWarningSection fieldKey="platform">
      <SectionHeader icon={Monitor} title={t("form.platform.title")} />
      <div className="grid grid-cols-3 gap-2">
        {platformOptions.map(({ value }) => (
          <SelectionCard
            key={value}
            icon={platformIcons[value]}
            title={t(platformLabelKeys[value])}
            description={t(platformDescKeys[value])}
            descriptionSize="2xs"
            isSelected={platform === value}
            onClick={() => setPlatform(value)}
          />
        ))}
      </div>
    </ImportWarningSection>
  );
});
