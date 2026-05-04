'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DocumentListItem } from '@/lib/types';
import { useLanguage } from '@/app/LanguageContext';
import { useT } from '@/lib/i18n';

export default function AdminDashboard() {
  const [docs, setDocs] = useState<DocumentListItem[]>([]);
  const { lang } = useLanguage();
  const t = useT(lang);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    fetch(`/api/documents?lang=${lang}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setDocs(data.documents || []));
  }, [lang]);

  const categories = [...new Set(docs.map(d => d.category))];
  const recentDocs = docs
    .filter(d => d.updatedAt)
    .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
    .slice(0, 5);

  const stats = [
    { label: t('admin.totalDocs'), value: docs.length, color: 'bg-blue-500' },
    { label: t('admin.categories'), value: categories.length, color: 'bg-green-500' },
    { label: t('admin.apiEndpoints'), value: docs.filter(d => d.api_method).length, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.dashboard')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Documentation management overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-12 rounded-full ${stat.color}`} />
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/admin/documents/new"
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">{t('admin.newDoc')}</div>
            <div className="text-sm text-gray-500">{t('admin.newDocDesc')}</div>
          </div>
        </Link>
        <Link
          href="/admin/documents"
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">{t('admin.manageDocs')}</div>
            <div className="text-sm text-gray-500">{t('admin.documents')}</div>
          </div>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">{t('admin.recentlyUpdated')}</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentDocs.map(doc => (
            <div key={doc.slug} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{doc.title}</div>
                <div className="text-sm text-gray-500">{doc.category}</div>
              </div>
              <div className="flex items-center gap-3">
                {doc.api_method && (
                  <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {doc.api_method}
                  </span>
                )}
                <Link
                  href={`/admin/documents/edit/${doc.slug}`}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {t('admin.edit')}
                </Link>
              </div>
            </div>
          ))}
          {recentDocs.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">{t('admin.noDocs')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
