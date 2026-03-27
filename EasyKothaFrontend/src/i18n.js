import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/translation.json";
import ne from "./locales/ne/translation.json";

const STORAGE_KEY = "easykotha_language";
const SUPPORTED_LANGUAGES = ["en", "ne"];

const getInitialLanguage = () => {
  if (typeof window === "undefined") {
    return "en";
  }

  const storedLanguage = localStorage.getItem(STORAGE_KEY)?.toLowerCase();
  if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage)) {
    return storedLanguage;
  }

  const browserLanguage = navigator.language?.split("-")[0]?.toLowerCase();
  if (browserLanguage && SUPPORTED_LANGUAGES.includes(browserLanguage)) {
    return browserLanguage;
  }

  return "en";
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ne: { translation: ne },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

if (typeof window !== "undefined") {
  i18n.on("languageChanged", (language) => {
    localStorage.setItem(STORAGE_KEY, language);
  });
}

export default i18n;
