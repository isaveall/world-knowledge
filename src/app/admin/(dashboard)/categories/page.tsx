'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/app/LanguageContext';
import { useT } from '@/lib/i18n';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { lang } = useLanguage();
  const t = useT(lang);

  const fetchCategories = useCallback(async () => {
    const token = localStorage.getItem('token') || '';
    const res = await fetch('/api/categories', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    // If no saved order, use alphabetically sorted available as default
    if (data.order.length === 0) {
      setCategories(data.available);
    } else {
      setCategories(data.order);
    }
    setAvailable(data.available);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...categories];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setCategories(next);
  };

  const moveDown = (idx: number) => {
    if (idx === categories.length - 1) return;
    const next = [...categories];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setCategories(next);
  };

  const addCategory = (name: string) => {
    if (!name || categories.includes(name)) return;
    setCategories([...categories, name]);
  };

  const removeCategory = (name: string) => {
    setCategories(categories.filter(c => c !== name));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    const token = localStorage.getItem('token') || '';
    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ order: categories }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMessage(lang === 'zh' ? '保存成功' : 'Saved successfully');
    } else {
      setMessage(data.error || (lang === 'zh' ? '保存失败' : 'Failed to save'));
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const notAdded = available.filter(c => !categories.includes(c));

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-500">{t('admin.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {lang === 'zh' ? '分类排序' : 'Category Order'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {lang === 'zh' ? '拖动或使用按钮调整左侧边栏分类顺序' : 'Reorder sidebar categories using the buttons'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
        >
          {saving ? (lang === 'zh' ? '保存中...' : 'Saving...') : (lang === 'zh' ? '保存顺序' : 'Save Order')}
        </button>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
          message.includes('成功') || message.includes('Success') || message.includes('Saved')
            ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        }`}>
          {message}
        </div>
      )}

      {/* Unadded categories */}
      {notAdded.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            {lang === 'zh' ? '未添加的分类' : 'Unadded Categories'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {notAdded.map(name => (
              <button
                key={name}
                onClick={() => addCategory(name)}
                className="px-3 py-1.5 text-sm rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                + {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ordered list */}
      <div className="space-y-2">
        {categories.map((name, idx) => (
          <div
            key={name}
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <span className="text-sm text-gray-400 dark:text-gray-500 w-6 text-right font-mono">{idx + 1}</span>
            <span className="flex-1 text-gray-900 dark:text-white font-medium">{name}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 text-gray-500 dark:text-gray-400 disabled:cursor-not-allowed transition-colors"
                title={lang === 'zh' ? '上移' : 'Move up'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => moveDown(idx)}
                disabled={idx === categories.length - 1}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 text-gray-500 dark:text-gray-400 disabled:cursor-not-allowed transition-colors"
                title={lang === 'zh' ? '下移' : 'Move down'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                onClick={() => removeCategory(name)}
                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors ml-2"
                title={lang === 'zh' ? '移除' : 'Remove'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            {lang === 'zh' ? '暂无分类，请先创建文档' : 'No categories yet. Create documents first.'}
          </div>
        )}
      </div>
    </div>
  );
}
