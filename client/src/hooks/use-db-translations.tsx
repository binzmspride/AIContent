import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';

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
  const language = user?.language || 'vi';

  const { data: translations = [], isLoading } = useQuery({
    queryKey: ['/api/admin/translations'],
    select: (response: any) => {
      const translationData = response?.data?.translations || [];
      console.log('DB Translations loaded:', translationData.length, 'items');
      return translationData;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false, // Don't retry if user doesn't have admin access
  });

  const t = (key: string, fallback?: string): string => {
    if (!translations || translations.length === 0) {
      // If no translations loaded, return fallback
      return fallback || key;
    }

    const translation = translations.find((t: Translation) => t.key === key);
    
    if (translation) {
      const result = language === 'en' ? translation.en : translation.vi;
      return result;
    }
    
    // Return fallback if translation not found
    return fallback || key;
  };

  return { t, isLoading, language };
}