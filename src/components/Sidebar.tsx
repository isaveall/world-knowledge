'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SidebarCategory } from '@/lib/types';
import { Lang } from '@/lib/i18n';

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  PUT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  PATCH: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

export default function Sidebar({ categories, lang }: { categories: SidebarCategory[]; lang: Lang }) {
  const pathname = usePathname();
  const currentSlug = pathname.replace(/^\/docs\/?/, '') || '';
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (name: string) => {
    setCollapsed(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const title = '世界知识文档';

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto h-screen sticky top-0">
      <div className="px-4 py-[14px] border-b border-gray-200 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold text-gray-900 dark:text-white">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.61 5.98.52 7.13-.62 1.61-1.57 3.2-2.57 4.08Z" />
            <path d="M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
          </svg>
          {title}
        </Link>
      </div>
      <nav className="p-3">
        {categories.map(cat => (
          <div key={cat.name} className="mb-2">
            <button
              onClick={() => toggleCategory(cat.name)}
              className="flex items-center justify-between w-full px-2 py-2 text-lg font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <span>{cat.name}</span>
              <svg
                className={`w-3 h-3 transition-transform ${collapsed[cat.name] ? '-rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!collapsed[cat.name] && (
              <ul className="mt-1 space-y-0.5">
                {cat.items.map(item => {
                  const isActive = item.slug === currentSlug;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/docs/${item.slug}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-base transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-900/50'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {item.api_method && (
                          <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${methodColors[item.api_method] || 'bg-gray-100 text-gray-600'}`}>
                            {item.api_method}
                          </span>
                        )}
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
