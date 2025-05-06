import React, { createContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'vi' | 'en';
export type TranslationKey = string;

// Define translations type structure
type TranslationData = {
  [key: string]: string | TranslationData;
};

type TranslationsType = {
  vi: TranslationData;
  en: TranslationData;
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoading: boolean;
}

// Default translations - very minimal to avoid errors before real translations load
const defaultTranslations = {
  vi: {
    common: {
      loading: "Đang tải...",
      error: "Đã xảy ra lỗi",
      appName: "SEO AI Writer",
    }
  },
  en: {
    common: {
      loading: "Loading...",
      error: "An error occurred",
      appName: "SEO AI Writer",
    }
  }
};

const defaultLanguage: Language = 'vi';

export const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
  isLoading: true,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage && (savedLanguage === 'en' || savedLanguage === 'vi') 
      ? savedLanguage 
      : defaultLanguage;
  });
  const [translations, setTranslations] = useState(defaultTranslations);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to load translations from API
  useEffect(() => {
    async function loadTranslations() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/translations');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setTranslations(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTranslations();
  }, []);

  // Effect to update language preference
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    try {
      const keys = key.split('.');
      let value: any = translations[language];

      for (const k of keys) {
        if (value === undefined) return key;
        value = value[k];
      }

      if (typeof value === 'string') {
        return value;
      }
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
    }

    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Export is now in hooks/use-language.tsx
