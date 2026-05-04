'use client';

import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/app/LanguageContext';
import { useT } from '@/lib/i18n';

function AdminBreadcrumb() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const t = useT(lang);
  const segments = pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);

  const labels: Record<string, string> = {
    '': t('admin.dashboard'),
    'documents': t('admin.documents'),
    'new': t('admin.newDoc'),
    'edit': t('admin.edit'),
    'users': t('admin.users'),
  };

  const breadcrumbs = segments.length === 0
    ? [{ href: '/admin', label: labels[''] }]
    : [{ href: '/admin', label: labels[''] }, ...segments.map((seg, i) => {
        const href = '/admin/' + segments.slice(0, i + 1).join('/');
        const label = labels[seg] || decodeURIComponent(seg);
        return { href, label };
      })];

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 min-w-0">
      <Link href="/" className="shrink-0 hover:text-gray-900 dark:hover:text-white transition-colors" title={lang === 'zh' ? '返回首页' : 'Home'}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
        </svg>
      </Link>
      {breadcrumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-2 min-w-0">
          {i > 0 && (
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {i === breadcrumbs.length - 1 ? (
            <span className="truncate text-gray-900 dark:text-white font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="truncate hover:text-gray-900 dark:hover:text-white transition-colors shrink-0">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetch('/api/documents', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      if (!res.ok) {
        localStorage.removeItem('token');
        router.push('/admin/login');
      } else {
        setAuthChecked(true);
      }
    }).catch(() => {
      setAuthChecked(true);
    });
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
          <AdminBreadcrumb />
          <LanguageSwitcher />
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
