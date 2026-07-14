import { useState, useEffect } from 'react';
import vi from '../locales/vi.json';
import en from '../locales/en.json';

const translations = { vi, en };
export type Locale = 'vi' | 'en';

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>('vi');

  useEffect(() => {
    // Basic client-side locale sync or read from localStorage if needed
    const saved = localStorage.getItem('dashboard-locale') as Locale;
    if (saved && translations[saved]) {
      setLocale(saved);
    }
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('dashboard-locale', newLocale);
  };

  const t = (keyPath: string) => {
    const keys = keyPath.split('.');
    let current: any = translations[locale];
    
    for (const key of keys) {
      if (current[key] === undefined) {
        // Fallback to vi
        let fallback: any = translations['vi'];
        for (const k of keys) {
           if(fallback[k] === undefined) return keyPath;
           fallback = fallback[k];
        }
        return fallback;
      }
      current = current[key];
    }
    
    return current;
  };

  return { t, locale, changeLocale };
}
