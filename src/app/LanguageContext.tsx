'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Lang } from '@/lib/i18n';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang;
    if (stored === 'en' || stored === 'zh') {
      setLangState(stored);
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
    document.cookie = `lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
