import {
  DEFAULT_LANGUAGE,
  isAppLanguage,
  type AppLanguage,
} from "../types/language";

const LANGUAGE_KEY = "vb-language";

export function loadLanguage(): AppLanguage {
  if (typeof localStorage === "undefined") return DEFAULT_LANGUAGE;

  const saved = localStorage.getItem(LANGUAGE_KEY);
  return isAppLanguage(saved) ? saved : DEFAULT_LANGUAGE;
}

export function saveLanguage(language: AppLanguage): void {
  localStorage.setItem(LANGUAGE_KEY, language);
}
