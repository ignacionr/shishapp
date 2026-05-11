import { useStore } from '@/store/useStore';
import { translations, Language } from '@/translations';
import { useState, useEffect } from 'react';

function getBrowserLang(): Language {
  if (typeof navigator === 'undefined') return 'en';
  const navLang = navigator.language.toLowerCase();
  if (navLang.startsWith('es')) return 'es-419';
  if (navLang.startsWith('pt')) return 'pt-BR';
  if (navLang.startsWith('ru')) return 'ru';
  if (navLang.startsWith('ka')) return 'ka';
  if (navLang.startsWith('it')) return 'it';
  return 'en';
}

export function useTranslation() {
  const { user } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Logged in user / Guest preference from store
  // 2. Browser language (if guest context hasn't loaded yet)
  // 3. English (default)
  const storeLang = user?.language as Language;

  const lang: Language = mounted 
    ? (storeLang || getBrowserLang()) 
    : 'en';

  const t = translations[lang] || translations.en;

  return { t, lang, mounted };
  }
