import { Music, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProjectStore } from "../../stores/projectStore";

const EXAMPLES = [
  "Lofi Girl",
  "Deep Focus",
  "spotify:playlist:0vvXsWfq9tJ0ujHaibFSDP",
  "https://open.spotify.com/playlist/...",
];

export function MusicSettingsPanel() {
  const { t } = useTranslation();
  const musicQuery = useProjectStore((s) => s.settings.musicQuery);
  const setMusicQuery = useProjectStore((s) => s.setMusicQuery);

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {t("settings.musicSection.title")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("settings.musicSection.description")}
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-vb-border dark:bg-zinc-900">
        <div className="mb-4 flex items-center gap-2">
          <Music className="h-4 w-4 text-vb-accent" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("settings.musicSectionExtended.trackTitle")}
          </h3>
        </div>

        <label
          htmlFor="music-query"
          className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          <Search className="h-3.5 w-3.5" />
          {t("settings.musicSectionExtended.queryLabel")}
        </label>
        <input
          id="music-query"
          type="text"
          value={musicQuery}
          onChange={(e) => setMusicQuery(e.target.value)}
          placeholder={t("settings.musicSectionExtended.queryPlaceholder")}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-vb-accent focus:ring-1 focus:ring-vb-accent dark:border-vb-border dark:bg-zinc-800 dark:text-zinc-100"
        />

        <p className="mt-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          <strong className="font-medium text-zinc-700 dark:text-zinc-300">
            {t("common.spotify")}:
          </strong>{" "}
          {t("settings.musicSectionExtended.spotifyHelp")}
          <br />
          <strong className="mt-1 inline-block font-medium text-zinc-700 dark:text-zinc-300">
            {t("common.youtubeMusic")}:
          </strong>{" "}
          {t("settings.musicSectionExtended.youtubeHelp")}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setMusicQuery(example)}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-600 transition-colors hover:border-vb-accent/40 hover:bg-vb-accent/5 hover:text-vb-accent dark:border-vb-border dark:bg-zinc-800 dark:text-zinc-400"
            >
              {example.length > 28 ? `${example.slice(0, 28)}…` : example}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
