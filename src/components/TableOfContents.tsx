'use client';

import { useEffect, useState } from 'react';
import { TocItem } from '@/lib/types';
import { Lang } from '@/lib/i18n';

export default function TableOfContents({ items, lang }: { items: TocItem[]; lang: Lang }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const title = lang === 'zh' ? '目录' : 'On this page';

  return (
    <nav className="w-56 shrink-0 hidden xl:block">
      <div className="sticky top-20 pl-4 border-l border-gray-200 dark:border-gray-800">
        <h4 className="text-lg font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
          {title}
        </h4>
        <ul className="space-y-1.5 text-base">
          {items.map(item => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block transition-colors ${
                  item.level === 3 ? 'pl-3' : item.level === 4 ? 'pl-6' : ''
                } ${
                  activeId === item.id
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
