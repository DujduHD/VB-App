import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { useProjectStore } from "../../stores/projectStore";
import { APP_LANGUAGES, type AppLanguage } from "../../types/language";

const LANGUAGE_FLAGS: Record<AppLanguage, string> = {
  tr: "🇹🇷",
  en: "🇬🇧",
  de: "🇩🇪",
  el: "🇬🇷",
};

export function LanguageSettingsPanel() {
  const { t } = useTranslation();
  const language = useProjectStore((s) => s.settings.language);
  const setLanguage = useProjectStore((s) => s.setLanguage);

  return (
    <div className="max-w-2xl space-y-5">
      <header>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {t("settings.languageSection.title")}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("settings.languageSection.description")}
        </p>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-vb-border dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t("settings.languageSection.label")}
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {APP_LANGUAGES.map((code) => {
            const selected = language === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                  selected
                    ? "border-vb-accent bg-vb-accent/10 ring-1 ring-vb-accent"
                    : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-vb-border dark:bg-zinc-800/50 dark:hover:border-zinc-600"
                }`}
              >
                {selected && (
                  <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-vb-accent" />
                )}
                <span className="text-2xl leading-none" aria-hidden>
                  {LANGUAGE_FLAGS[code]}
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {t(`languages.${code}`)}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-zinc-400">
                  {code}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
