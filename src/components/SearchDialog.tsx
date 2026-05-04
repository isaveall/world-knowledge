'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchResult } from '@/lib/types';
import { Lang } from '@/lib/i18n';

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  PUT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function SearchDialog({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const t = (key: string) => {
    const map: Record<string, string> = {
      placeholder: lang === 'zh' ? '搜索文档...' : 'Search documentation...',
      searching: lang === 'zh' ? '搜索中...' : 'Searching...',
      noResults: lang === 'zh' ? '未找到结果' : 'No results found',
      searchDocs: lang === 'zh' ? '搜索文档...' : 'Search docs...',
    };
    return map[key] || key;
  };

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&lang=${lang}`);
      const data = await res.json();
      setResults(data.results || []);
      setSelectedIndex(0);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, [lang]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const navigateTo = (slug: string) => {
    router.push(`/docs/${slug}`);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      navigateTo(results[selectedIndex].slug);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>{t('searchDocs')}</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            className="w-full px-3 py-4 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <kbd
            onClick={() => setOpen(false)}
            className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded cursor-pointer"
          >
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-8 text-center text-gray-500">{t('searching')}</div>
          )}
          {!loading && query && results.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">{t('noResults')}</div>
          )}
          {results.map((result, i) => (
            <button
              key={result.slug}
              onClick={() => navigateTo(result.slug)}
              className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                i === selectedIndex ? 'bg-blue-50 dark:bg-blue-950' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {result.api_method && (
                    <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${methodColors[result.api_method] || ''}`}>
                      {result.api_method}
                    </span>
                  )}
                  <span className="font-medium text-gray-900 dark:text-white truncate">{result.title}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{result.category} {result.api_path && `· ${result.api_path}`}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{result.excerpt}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
