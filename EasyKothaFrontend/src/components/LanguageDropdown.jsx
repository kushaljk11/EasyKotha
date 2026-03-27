import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "easykotha_language";

const LANGUAGES = [
  { code: "en", labelKey: "language.options.en", shortLabel: "En" },
  { code: "ne", labelKey: "language.options.ne", shortLabel: "Np" },
];

const normalizeLanguageCode = (value) => {
  const baseCode = String(value || "en").toLowerCase().split("-")[0];
  return LANGUAGES.some((item) => item.code === baseCode) ? baseCode : "en";
};

export default function LanguageDropdown({ compact = false, className = "" }) {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(() => normalizeLanguageCode(localStorage.getItem(STORAGE_KEY) || i18n.language || "en"));

  useEffect(() => {
    setLanguage(normalizeLanguageCode(i18n.language || "en"));
  }, [i18n.language]);

  const onSelectLanguage = async (nextLanguage) => {
    const normalized = normalizeLanguageCode(nextLanguage || "en");
    setLanguage(normalized);
    localStorage.setItem(STORAGE_KEY, normalized);
    await i18n.changeLanguage(normalized);
  };

  return (
    <div className={`relative ${className}`.trim()} data-no-translate="true">
      <label htmlFor="language-switcher" className="sr-only">
        {t("language.labelChoose")}
      </label>
      <Languages
        size={compact ? 14 : 15}
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-green-700 ${compact ? "left-2" : "left-2.5"}`}
      />
      <select
        id="language-switcher"
        value={language}
        onChange={(event) => onSelectLanguage(event.target.value)}
        aria-label={t("language.labelChoose")}
        className={
          compact
            ? "h-9 w-[72px] appearance-none rounded-lg border border-green-200 bg-white pl-7 pr-5 text-xs font-semibold text-green-800 outline-none transition hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
            : "h-9 appearance-none rounded-lg border border-green-200 bg-white pl-8 pr-7 text-xs font-semibold text-green-800 outline-none transition hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
        }
        title={t("language.selectorTitle")}
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {compact ? item.shortLabel : t(item.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
