import { useContext } from 'react';
import { LanguageContext } from '@/providers/LanguageProvider';

function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}

export { useLanguage };
