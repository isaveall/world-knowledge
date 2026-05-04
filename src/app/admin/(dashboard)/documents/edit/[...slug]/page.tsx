'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DocumentEditor from '@/components/admin/DocumentEditor';
import { Document, DocumentMeta } from '@/lib/types';
import { useLanguage } from '@/app/LanguageContext';
import { useT } from '@/lib/i18n';

export default function EditDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const slugStr = (params.slug as string[]).join('/');
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const t = useT(lang);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    fetch(`/api/documents/${slugStr}?lang=${lang}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setDoc(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slugStr, lang]);

  const handleSave = async (meta: Partial<DocumentMeta>, content: string, docLang: string) => {
    const token = localStorage.getItem('token') || '';
    const res = await fetch(`/api/documents/${slugStr}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...meta, content, lang: docLang }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update document');
    }

    const data = await res.json();
    const resSlug = data.slug;
    if (resSlug && resSlug !== slugStr) {
      router.push(`/admin/documents/edit/${resSlug}`);
    }
    router.push('/admin/documents');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-500">{t('admin.loading')}</div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-8">
        <div className="text-red-500">{t('doc.notFound')}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.editDocument')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-mono text-sm break-all">{decodeURIComponent(slugStr)}</p>
      </div>
      <DocumentEditor
        initialMeta={{
          title: doc.title,
          slug: doc.slug,
          category: doc.category,
          order: doc.order,
          tags: doc.tags,
          api_method: doc.api_method,
          api_path: doc.api_path,
        }}
        initialContent={doc.content}
        onSave={handleSave}
      />
    </div>
  );
}
