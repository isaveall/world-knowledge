'use client';

import AdminSidebar from '@/components/admin/AdminSidebar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex justify-end">
          <LanguageSwitcher />
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
