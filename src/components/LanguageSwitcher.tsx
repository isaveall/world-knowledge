'use client';

import { useLanguage } from '@/app/LanguageContext';
import { LANGUAGES, Lang } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 text-sm">
      {LANGUAGES.map(({ key, flag }) => (
        <button
          key={key}
          onClick={() => setLang(key)}
          className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
            lang === key
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          title={key === 'en' ? 'English' : '中文'}
        >
          {flag}
        </button>
      ))}
    </div>
  );
}
