'use client';

import { useEffect, useState } from 'react';
import UserTable from '@/components/admin/UserTable';
import { User } from '@/lib/types';
import { useLanguage } from '@/app/LanguageContext';
import { useT } from '@/lib/i18n';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('viewer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const t = useT(lang);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token') || '';
    const res = await fetch('/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUserId(user.id);
    }
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token') || '';
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: newUsername,
        password: newPassword,
        role: newRole,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to create user');
      return;
    }

    setNewUsername('');
    setNewPassword('');
    setNewRole('viewer');
    setShowAdd(false);
    fetchUsers();
  };

  const handleRoleChange = async (userId: number, role: string) => {
    const token = localStorage.getItem('token') || '';
    await fetch('/api/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, role }),
    });
    fetchUsers();
  };

  const handleDelete = async (userId: number) => {
    const token = localStorage.getItem('token') || '';
    const res = await fetch('/api/users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-500">{t('admin.loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.users')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{users.length} users total</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('admin.addUser')}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{t('admin.createUser')}</h2>
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleAddUser} className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.username')}</label>
              <input
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.password')}</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('admin.role')}</label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              {t('admin.create')}
            </button>
          </form>
        </div>
      )}

      <UserTable
        users={users}
        currentUserId={currentUserId}
        onRoleChange={handleRoleChange}
        onDelete={handleDelete}
      />
    </div>
  );
}
