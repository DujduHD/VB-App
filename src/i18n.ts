import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { loadLanguage } from "./services/languageStorage";
import tr from "./locales/tr.json";
import en from "./locales/en.json";
import de from "./locales/de.json";
import el from "./locales/el.json";

const initialLanguage = loadLanguage();

void i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
    de: { translation: de },
    el: { translation: el },
  },
  lng: initialLanguage,
  fallbackLng: "tr",
  interpolation: {
    escapeValue: false,
  },
});

document.documentElement.lang = initialLanguage;

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
