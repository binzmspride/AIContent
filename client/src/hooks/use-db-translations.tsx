import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

interface Translation {
  key: string;
  vi: string;
  en: string;
  category?: string;
}

interface UseDbTranslationsResult {
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
  language: string;
}

export function useDbTranslations(): UseDbTranslationsResult {
  const { user } = useAuth();
  const { language: currentLanguage } = useLanguage();
  const language = currentLanguage;

  const { data: translations = [], isLoading } = useQuery({
    queryKey: ['/api/admin/translations', { limit: 1000 }], // Get all translations
    select: (response: any) => {
      const translationData = response?.data?.translations || [];
      return translationData;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: !!user, // Only fetch when user is loaded
    retry: false,
  });

  const t = (key: string, fallback?: string): string => {
    if (!translations || translations.length === 0) {
      console.log(`[useDbTranslations] No translations loaded, returning fallback for ${key}`);
      return fallback || key;
    }

    const translation = translations.find((t: Translation) => t.key === key);
    
    if (translation) {
      const result = language === 'en' ? translation.en : translation.vi;
      console.log(`[useDbTranslations] Found translation for ${key}: ${result} (language: ${language})`);
      return result;
    }
    
    console.log(`[useDbTranslations] No translation found for ${key}, returning fallback`);
    return fallback || key;
  };

  return { t, isLoading, language };
}