import { useState, useEffect, useCallback } from 'react';
import { translations, Language } from '../data/translations';
import { storageService } from '../services/storageService';

// Module-level subscribers and current language state
const listeners = new Set<(lang: Language) => void>();

function getInitialLanguage(): Language {
  try {
    const saved = storageService.getSettings().language;
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {
    // fallback
  }
  return 'en';
}

let currentLanguage: Language = getInitialLanguage();

// Ensure initial DOM state matches
if (typeof document !== 'undefined') {
  document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLanguage;
}

export function setAppLanguage(newLang: Language) {
  if (currentLanguage === newLang) return;
  currentLanguage = newLang;
  
  const s = storageService.getSettings();
  s.language = newLang;
  storageService.saveSettings(s);

  if (typeof document !== 'undefined') {
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  }

  listeners.forEach((listener) => {
    try {
      listener(newLang);
    } catch (e) {
      console.error('Error notifying translation listener', e);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dhikrflow:lang_changed', { detail: newLang }));
  }
}

export function useTranslation() {
  const [lang, setLang] = useState<Language>(() => currentLanguage);

  useEffect(() => {
    // Sync if current global language differs
    if (lang !== currentLanguage) {
      setLang(currentLanguage);
    }

    const listener = (newLang: Language) => {
      setLang(newLang);
    };

    listeners.add(listener);

    const handleStorageChange = () => {
      const stored = storageService.getSettings().language;
      if (stored && stored !== currentLanguage) {
        setAppLanguage(stored);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [lang]);

  const changeLanguage = useCallback((newLang: Language) => {
    setAppLanguage(newLang);
  }, []);

  const t = translations[lang] || translations.en;

  return { t, lang, isRTL: lang === 'ar', changeLanguage };
}

