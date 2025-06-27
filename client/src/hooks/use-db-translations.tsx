import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { useEffect, useMemo } from 'react';

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
  const queryClient = useQueryClient();

  // Clear all translation cache and refetch on language change or component mount
  useEffect(() => {
    console.log(`[useDbTranslations] Language changed to: ${language}, clearing all cache and refetching translations`);
    queryClient.removeQueries({ queryKey: ['/api/admin/translations'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/translations'] });
  }, [language, queryClient]);

  const { data: translations = [], isLoading } = useQuery({
    queryKey: ['/api/admin/translations', language, Math.random()], // Force new query every time
    select: (response: any) => {
      const translationData = response?.data?.translations || [];
      console.log(`[useDbTranslations] Loaded ${translationData.length} translations for language: ${language}`);
      return translationData;
    },
    staleTime: 0, // No caching - always fresh data
    gcTime: 0, // Don't keep in cache (TanStack Query v5)
    enabled: !!user, // Only fetch when user is loaded
    retry: false,
    refetchOnMount: true, // Always refetch on component mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  const t = useMemo(() => {
    return (key: string, fallback?: string): string => {
      if (!translations || translations.length === 0) {
        console.log(`[useDbTranslations] No translations loaded, returning fallback for ${key} (current language: ${language})`);
        return fallback || key;
      }

      const translation = translations.find((t: Translation) => t.key === key);
      
      if (translation) {
        const result = language === 'en' ? translation.en : translation.vi;
        console.log(`[useDbTranslations] Found translation for ${key}: "${result}" (language: ${language}, en: "${translation.en}", vi: "${translation.vi}")`);
        return result || fallback || key;
      }
      
      console.log(`[useDbTranslations] No translation found for ${key}, returning fallback (current language: ${language})`);
      return fallback || key;
    };
  }, [translations, language]);

  return { t, isLoading, language };
}