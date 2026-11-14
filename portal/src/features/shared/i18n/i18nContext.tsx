import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { SupportedLanguage } from './utils/getLocalized';
import { getLocalizedText } from './utils/getLocalized';
import enTranslations from './translations/en.json';
import amTranslations from './translations/am.json';
import omTranslations from './translations/om.json';

const STORAGE_KEY = 'civiclink_portal_language';

const dictionaries: Record<SupportedLanguage, any> = {
  en: enTranslations,
  am: amTranslations,
  om: omTranslations,
};

interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (keyPath: string, fallback?: string) => string;
  getLocalized: (value: any, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
      if (saved === 'en' || saved === 'am' || saved === 'om') {
        return saved;
      }
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  };

  const t = useMemo(() => {
    return (keyPath: string, fallback?: string): string => {
      const currentDict = dictionaries[language] || enTranslations;
      const keys = keyPath.split('.');
      let result = currentDict;

      const defaultFallback = fallback !== undefined
        ? fallback
        : (() => {
            const raw = keys[keys.length - 1] || keyPath;
            return raw
              .replace(/([A-Z])/g, ' $1')
              .replace(/[-_]/g, ' ')
              .replace(/^\w/, (c) => c.toUpperCase())
              .trim();
          })();

      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          // Fallback to English dictionary
          let enResult = enTranslations as any;
          for (const ek of keys) {
            if (enResult && typeof enResult === 'object' && ek in enResult) {
              enResult = enResult[ek];
            } else {
              return defaultFallback;
            }
          }
          return typeof enResult === 'string' ? enResult : defaultFallback;
        }
      }

      return typeof result === 'string' ? result : defaultFallback;
    };
  }, [language]);

  const getLocalized = useMemo(() => {
    return (value: any, fallback: string = ''): string => {
      return getLocalizedText(value, language, fallback);
    };
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, getLocalized }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useLanguage(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within an I18nProvider');
  }
  return ctx;
}

