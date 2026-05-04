'use client';

import { useRouter } from 'next/navigation';
import DocumentEditor from '@/components/admin/DocumentEditor';
import { DocumentMeta } from '@/lib/types';
import { useLanguage } from '@/app/LanguageContext';
import { useT } from '@/lib/i18n';

export default function NewDocumentPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = useT(lang);

  const handleSave = async (meta: Partial<DocumentMeta>, content: string, docLang: string) => {
    const token = localStorage.getItem('token') || '';
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...meta, content, lang: docLang }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create document');
    }

    router.push('/admin/documents');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.newDocument')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('admin.newDocDesc')}</p>
      </div>
      <DocumentEditor isNew onSave={handleSave} />
    </div>
  );
}
