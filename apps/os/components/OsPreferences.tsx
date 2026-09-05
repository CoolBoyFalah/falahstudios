"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";
type Language = "en" | "ar";

export default function OsPreferences() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("falah_os_theme") as Theme | null) || "dark";
    const savedLanguage = (localStorage.getItem("falah_os_language") as Language | null) || "en";
    apply(savedTheme, savedLanguage);
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    window.dispatchEvent(new Event("falah-language-change"));
  }, []);

  function apply(nextTheme: Theme, nextLanguage: Language) {
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.lang = nextLanguage;
    document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";
  }

  function changeTheme(nextTheme: Theme) {
    localStorage.setItem("falah_os_theme", nextTheme);
    apply(nextTheme, language);
    setTheme(nextTheme);
  }

  function changeLanguage(nextLanguage: Language) {
    localStorage.setItem("falah_os_language", nextLanguage);
    apply(theme, nextLanguage);
    setLanguage(nextLanguage);
    window.dispatchEvent(new Event("falah-language-change"));
  }

  return (
    <div className="flex items-center gap-1 rounded-xl border border-amber-500/20 bg-black/40 p-1 text-[10px] font-medium">
      <button type="button" onClick={() => changeLanguage(language === "en" ? "ar" : "en")} className="rounded-lg px-2.5 py-2 text-amber-300 hover:bg-amber-500/10" aria-label="Switch language">
        {language === "en" ? "العربية" : "EN"}
      </button>
      <span className="h-4 w-px bg-amber-500/20" />
      <button type="button" onClick={() => changeTheme("dark")} className={`rounded-lg px-2.5 py-2 ${theme === "dark" ? "bg-amber-500 text-[#080808]" : "text-zinc-400 hover:text-amber-300"}`} aria-label="Use dark theme">Dark</button>
      <button type="button" onClick={() => changeTheme("light")} className={`rounded-lg px-2.5 py-2 ${theme === "light" ? "bg-amber-500 text-[#080808]" : "text-zinc-400 hover:text-amber-300"}`} aria-label="Use light theme">Light</button>
    </div>
  );
}
