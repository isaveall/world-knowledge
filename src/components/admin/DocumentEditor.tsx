'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { DocumentMeta } from '@/lib/types';
import { useLanguage } from '@/app/LanguageContext';
import { useT, LANGUAGES } from '@/lib/i18n';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface DocumentEditorProps {
  initialMeta?: Partial<DocumentMeta>;
  initialContent?: string;
  isNew?: boolean;
  onSave: (meta: Partial<DocumentMeta>, content: string, lang: string) => Promise<void>;
}

export default function DocumentEditor({
  initialMeta = {},
  initialContent = '',
  isNew = false,
  onSave,
}: DocumentEditorProps) {
  const [title, setTitle] = useState(initialMeta.title || '');
  const [slug, setSlug] = useState(initialMeta.slug || '');
  const [category, setCategory] = useState(initialMeta.category || '');
  const [order, setOrder] = useState(initialMeta.order ?? 999);
  const [tags, setTags] = useState((initialMeta.tags || []).join(', '));
  const [apiMethod, setApiMethod] = useState(initialMeta.api_method || '');
  const [apiPath, setApiPath] = useState(initialMeta.api_path || '');
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showMeta, setShowMeta] = useState(true);
  const { lang } = useLanguage();
  const t = useT(lang);
  const [docLang, setDocLang] = useState<string>(lang);

  const handleSave = async () => {
    if (!title.trim()) { setError(t('admin.titleRequired')); return; }
    if (isNew && !slug.trim()) { setError(t('admin.slugRequired')); return; }
    if (!content.trim()) { setError(t('admin.contentRequired')); return; }

    setSaving(true);
    setError('');

    try {
      await onSave(
        {
          title,
          slug: slug || undefined,
          category: category || 'Uncategorized',
          order,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
          api_method: apiMethod || undefined,
          api_path: apiPath || undefined,
        },
        content,
        docLang
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
    setSaving(false);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <button
          onClick={() => setShowMeta(!showMeta)}
          className="w-full px-6 py-4 flex items-center justify-between text-left"
        >
          <span className="font-semibold text-gray-900 dark:text-white">{t('admin.metadata')}</span>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${showMeta ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showMeta && (
          <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {isNew && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                <select
                  value={docLang}
                  onChange={e => setDocLang(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.key} value={l.key}>{l.label}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.title')} *</label>
              <input
                type="text"
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Chat Completions"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.slug')} *</label>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                disabled={!isNew}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="api-reference/chat-completions"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.category')}</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="API Reference"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.order')}</label>
              <input
                type="number"
                value={order}
                onChange={e => setOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.tags')}</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="api, chat, completions"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.apiMethod')}</label>
                <select
                  value={apiMethod}
                  onChange={e => setApiMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('admin.none')}</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.apiPath')}</label>
                <input
                  type="text"
                  value={apiPath}
                  onChange={e => setApiPath(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/v1/chat/completions"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4" data-color-mode="light">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('admin.content')} *</label>
        <MDEditor
          value={content}
          onChange={val => setContent(val || '')}
          height={500}
          preview="live"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
        >
          {saving ? t('admin.saving') : isNew ? t('admin.createDoc') : t('admin.saveChanges')}
        </button>
      </div>
    </div>
  );
}
