import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { translations, type Language } from '@/constants/translations';

type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (typeof translations)[Language] };
const LanguageContext = createContext<LanguageContextValue | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('ui-language') as Language) || 'en');
  useEffect(() => localStorage.setItem('ui-language', language), [language]);
  const value = useMemo(() => ({ language, setLanguage, t: translations[language] }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const value = useContext(LanguageContext); if (!value) throw new Error('useLanguage must be used inside LanguageProvider'); return value; }
