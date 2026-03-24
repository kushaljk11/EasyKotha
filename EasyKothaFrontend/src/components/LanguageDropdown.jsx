import { useState } from "react";
import { Languages } from "lucide-react";
import toast from "react-hot-toast";

const STORAGE_KEY = "easykotha_language";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ne", label: "Nepali" },
];

export default function LanguageDropdown() {
  const [language, setLanguage] = useState(() => (localStorage.getItem(STORAGE_KEY) || "en").toLowerCase());

  const onClickLanguageDropdown = () => {
    toast("Translation Coming Soon", { id: "translation-coming-soon" });
  };

  const onSelectLanguage = (nextLanguage) => {
    const normalized = String(nextLanguage || "en").toLowerCase();
    setLanguage(normalized);
    localStorage.setItem(STORAGE_KEY, normalized);
  };

  return (
    <div className="relative" data-no-translate="true">
      <label htmlFor="language-switcher" className="sr-only">
        Choose language
      </label>
      <Languages size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-green-700" />
      <select
        id="language-switcher"
        value={language}
        onClick={onClickLanguageDropdown}
        onChange={(event) => onSelectLanguage(event.target.value)}
        className="h-9 rounded-lg border border-green-200 bg-white pl-8 pr-7 text-xs font-semibold text-green-800 outline-none transition hover:border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-100"
        title="Language selector (display only)"
      >
        {LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
