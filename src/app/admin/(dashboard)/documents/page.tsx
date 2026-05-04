'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DocumentListItem } from '@/lib/types';
import { useLanguage } from '@/app/LanguageContext';
import { useT } from '@/lib/i18n';

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentListItem[]>([]);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const { lang } = useLanguage();
  const t = useT(lang);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    fetch(`/api/documents?lang=${lang}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setDocs(data.documents || []));
  }, [lang]);

  const filteredDocs = docs.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase()) ||
    d.slug.toLowerCase().includes(search.toLowerCase())
  );

  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, DocumentListItem[]>);

  const handleDelete = async (slug: string) => {
    if (!confirm(t('admin.confirmDelete'))) return;
    setDeleting(slug);
    const token = localStorage.getItem('token') || '';
    const res = await fetch(`/api/documents/${slug}?lang=${lang}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setDocs(docs.filter(d => d.slug !== slug));
    }
    setDeleting(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.documents')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{docs.length} {t('admin.documentList')}</p>
        </div>
        <Link
          href="/admin/documents/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('admin.newDoc')}
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('admin.searchDocs')}
          className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {Object.entries(groupedDocs).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            {category} ({items.length})
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('admin.title')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('admin.slug')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('admin.method')}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('admin.updated')}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map(doc => (
                  <tr key={doc.slug} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 dark:text-white">{doc.title}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">{doc.slug}</td>
                    <td className="px-4 py-3">
                      {doc.api_method ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          doc.api_method === 'GET' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          doc.api_method === 'POST' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          doc.api_method === 'PUT' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {doc.api_method}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/docs/${doc.slug}`}
                          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          target="_blank"
                        >
                          {t('admin.view')}
                        </Link>
                        <Link
                          href={`/admin/documents/edit/${doc.slug}`}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          {t('admin.edit')}
                        </Link>
                        <button
                          onClick={() => handleDelete(doc.slug)}
                          disabled={deleting === doc.slug}
                          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 disabled:opacity-50"
                        >
                          {deleting === doc.slug ? t('admin.deleting') : t('admin.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {filteredDocs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {search ? t('admin.noDocsMatch') : t('admin.createFirstDoc')}
        </div>
      )}
    </div>
  );
}
