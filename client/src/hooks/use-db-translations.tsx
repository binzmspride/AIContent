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
    queryKey: ['/api/public/translations'],
    select: (response: any) => {
      console.log('Translations API response:', response);
      return response?.data?.translations || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const t = (key: string, fallback?: string): string => {
    console.log('Looking for translation:', key, 'Language:', language, 'Translations length:', translations.length);
    const translation = translations.find((t: Translation) => t.key === key);
    
    if (translation) {
      const result = language === 'en' ? translation.en : translation.vi;
      console.log('Found translation:', key, '->', result);
      return result;
    }
    
    console.log('Translation not found for key:', key, 'using fallback:', fallback);
    // Return fallback or key if translation not found
    return fallback || key;
  };

  return { t, isLoading, language };
}