import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { vi } from '../../../server/locales/vi';
import { en } from '../../../server/locales/en';

export type Language = 'vi' | 'en';
export type TranslationKey = string;

type Translations = typeof vi;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const defaultLanguage: Language = 'vi';

const languages = {
  vi,
  en,
};

export const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = languages[language];

    for (const k of keys) {
      if (value === undefined) return key;
      value = value[k];
    }

    if (typeof value === 'string') {
      return value;
    }

    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
