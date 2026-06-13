import { memo } from "react";
import { Music, Ban, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MusicProvider } from "../../types/project";
import { MUSIC_PROVIDERS } from "../../constants/musicProviders";
import {
  getMusicProviderDesc,
  getMusicProviderLabel,
} from "../../utils/musicProviderLabels";

const musicIcons: Record<MusicProvider, LucideIcon> = {
  none: Ban,
  spotify: Music,
  "youtube-music": Radio,
};

export const MusicProviderGrid = memo(function MusicProviderGrid({
  value,
  onChange,
}: {
  value: MusicProvider;
  onChange: (provider: MusicProvider) => void;
}) {
  useTranslation();
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {MUSIC_PROVIDERS.map((provider) => {
        const Icon = musicIcons[provider];
        const selected = value === provider;

        return (
          <button
            key={provider}
            type="button"
            onClick={() => onChange(provider)}
            className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all ${
              selected
                ? "border-vb-accent bg-vb-accent/10 ring-1 ring-vb-accent"
                : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-vb-border dark:bg-zinc-900 dark:hover:border-zinc-600"
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                selected
                  ? "bg-vb-accent text-white"
                  : provider === "spotify"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : provider === "youtube-music"
                      ? "bg-red-500/15 text-red-600 dark:text-red-400"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {getMusicProviderLabel(provider)}
              </span>
              <span className="mt-0.5 block text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">
                {getMusicProviderDesc(provider)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
});
