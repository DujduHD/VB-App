import { memo } from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDensity } from "../../hooks/useDensity";
import { TitleWithTooltip } from "../ui/TitleWithTooltip";
import { CodeEditorPicker } from "./CodeEditorPicker";
import { UiUxToolPicker } from "./UiUxToolPicker";
import { MusicProviderPicker } from "./MusicProviderPicker";

export const VibeSection = memo(function VibeSection() {
  const { t } = useTranslation();
  const { vibeSpace } = useDensity();

  return (
    <div className={vibeSpace}>
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-vb-accent" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
          <TitleWithTooltip
            title={t("form.vibe.title")}
            tooltip={t("tooltips.vibeMode")}
          />
        </h3>
      </div>
      <CodeEditorPicker />
      <UiUxToolPicker />
      <MusicProviderPicker />
    </div>
  );
});
