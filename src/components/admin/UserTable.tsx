'use client';

import { useState } from 'react';
import { User } from '@/lib/types';
import { useLanguage } from '@/app/LanguageContext';
import { useT } from '@/lib/i18n';

interface UserTableProps {
  users: User[];
  currentUserId: number;
  onRoleChange: (userId: number, role: string) => Promise<void>;
  onDelete: (userId: number) => Promise<void>;
}

export default function UserTable({ users, currentUserId, onRoleChange, onDelete }: UserTableProps) {
  const [changing, setChanging] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const { lang } = useLanguage();
  const t = useT(lang);

  const handleRoleChange = async (userId: number, role: string) => {
    setChanging(userId);
    await onRoleChange(userId, role);
    setChanging(null);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm(t('admin.confirmDeleteUser'))) return;
    setDeleting(userId);
    await onDelete(userId);
    setDeleting(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('admin.username')}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('admin.role')}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('admin.created')}</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('admin.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map(user => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                    {isSelf && (
                      <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded">
                        {t('admin.you')}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    disabled={changing === user.id || isSelf}
                    className={`px-2 py-1 text-sm rounded border ${
                      user.role === 'admin'
                        ? 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : user.role === 'editor'
                        ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    } outline-none disabled:opacity-50`}
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={deleting === user.id || isSelf}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 disabled:opacity-50"
                  >
                    {deleting === user.id ? t('admin.deleting') : t('admin.delete')}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
