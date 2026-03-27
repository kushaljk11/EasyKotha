import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "easykotha_language";

const LANGUAGES = [
  { code: "en", labelKey: "language.options.en" },
  { code: "ne", labelKey: "language.options.ne" },
];

export default function LanguageDropdown() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(() => (localStorage.getItem(STORAGE_KEY) || i18n.language || "en").toLowerCase());

  useEffect(() => {
    setLanguage((i18n.language || "en").toLowerCase());
  }, [i18n.language]);

  const onSelectLanguage = async (nextLanguage) => {
    const normalized = String(nextLanguage || "en").toLowerCase();
    setLanguage(normalized);
    localStorage.setItem(STORAGE_KEY, normalized);
    await i18n.changeLanguage(normalized);
  };

  return (
    <div className="relative" data-no-translate="true">
      <label htmlFor="language-switcher" className="sr-only">
        {t("language.labelChoose")}
      </label>
      <Languages size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-green-700" />
      <select
        id="language-switcher"
        value={language}
        onChange={(event) => onSelectLanguage(event.target.value)}
        className="h-9 rounded-lg border border-green-200 bg-white pl-8 pr-7 text-xs font-semibold text-green-800 outline-none transition hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
        title={t("language.selectorTitle")}
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {t(item.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
