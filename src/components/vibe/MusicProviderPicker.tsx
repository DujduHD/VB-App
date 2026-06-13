import { memo } from "react";
import { Music } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";
import { MusicProviderGrid } from "../shared/MusicProviderGrid";
import { SectionHeader } from "../new-project/SectionHeader";

export const MusicProviderPicker = memo(function MusicProviderPicker() {
  const { t } = useTranslation();
  const musicProvider = useProjectStore((s) => s.form.vibe.musicProvider);
  const setVibe = useProjectStore((s) => s.setVibe);

  return (
    <div>
      <SectionHeader icon={Music} title={t("form.vibe.music")} />
      <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
        {t("form.vibeExtended.musicDesc", {
          settings: t("form.vibeExtended.musicSettingsPath"),
        })}
      </p>
      <MusicProviderGrid
        value={musicProvider}
        onChange={(provider) => setVibe({ musicProvider: provider })}
      />
    </div>
  );
});
