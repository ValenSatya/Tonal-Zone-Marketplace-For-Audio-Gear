"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "@/lib/translations";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "English",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState("English");

  // Read language from localStorage on mount
  useEffect(() => {
    try {
      const directLang = localStorage.getItem("tonalzone_lang");
      if (directLang && (directLang === "English" || directLang === "Bahasa Indonesia")) {
        setLanguageState(directLang);
      } else {
        const stored = localStorage.getItem("tonalzone_user");
        if (stored) {
          const u = JSON.parse(stored);
          if (u.language && translations[u.language]) {
            setLanguageState(u.language);
          }
        }
      }
    } catch (e) {}

    // Listen for language changes from settings page or other sources
    const handleChange = () => {
      try {
        const directLang = localStorage.getItem("tonalzone_lang");
        if (directLang && (directLang === "English" || directLang === "Bahasa Indonesia")) {
          setLanguageState(directLang);
        } else {
          const stored = localStorage.getItem("tonalzone_user");
          if (stored) {
            const u = JSON.parse(stored);
            if (u.language && translations[u.language]) {
              setLanguageState(u.language);
            }
          }
        }
      } catch (e) {}
    };

    window.addEventListener("userLoginChange", handleChange);
    window.addEventListener("languageChange", handleChange);
    return () => {
      window.removeEventListener("userLoginChange", handleChange);
      window.removeEventListener("languageChange", handleChange);
    };
  }, []);

  const setLanguage = useCallback((lang: string) => {
    const resolvedLang =
      lang === "ID" || lang === "id" || lang === "Bahasa Indonesia" || lang === "Indonesian"
        ? "Bahasa Indonesia"
        : "English";

    setLanguageState(resolvedLang);
    try {
      localStorage.setItem("tonalzone_lang", resolvedLang);
      const stored = localStorage.getItem("tonalzone_user");
      const u = stored ? JSON.parse(stored) : {};
      u.language = resolvedLang;
      localStorage.setItem("tonalzone_user", JSON.stringify(u));
      window.dispatchEvent(new Event("userLoginChange"));
      window.dispatchEvent(new Event("languageChange"));
    } catch (e) {}
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "English" ? "Bahasa Indonesia" : "English");
  }, [language, setLanguage]);

  const t = useCallback(
    (key: string): string => {
      const langDict = translations[language] || translations["English"];
      const enDict = translations["English"];
      return (langDict as any)?.[key] || (enDict as any)?.[key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

