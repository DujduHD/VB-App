export const APP_LANGUAGES = ["tr", "en", "de", "el"] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = "tr";

export function isAppLanguage(value: unknown): value is AppLanguage {
  return (
    value === "tr" ||
    value === "en" ||
    value === "de" ||
    value === "el"
  );
}
