import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDb } from './db';
import { User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'doc-management-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h';

export function signToken(user: { id: number; username: string; role: string }): string {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token: string): { id: number; username: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string };
  } catch {
    return null;
  }
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function getUserFromRequest(request: Request): { id: number; username: string; role: string } | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.slice(7));
}

export function getUserFromCookie(cookieHeader: string | null): { id: number; username: string; role: string } | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/auth_token=([^;]+)/);
  if (!match) return null;
  return verifyToken(match[1]);
}

export function authenticateUser(username: string, password: string): User | null {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as (User & { password_hash: string }) | undefined;
  if (!user) return null;
  if (!verifyPassword(password, user.password_hash)) return null;
  const { password_hash, ...userData } = user;
  return userData;
}

export function getAllUsers(): User[] {
  const db = getDb();
  return db.prepare('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC').all() as User[];
}

export function createUser(username: string, password: string, role: string = 'viewer'): User | null {
  const db = getDb();
  try {
    const hash = hashPassword(password);
    const result = db.prepare(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)'
    ).run(username, hash, role);
    return {
      id: result.lastInsertRowid as number,
      username,
      role: role as User['role'],
      created_at: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function updateUserRole(userId: number, role: string): boolean {
  const db = getDb();
  const result = db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
  return result.changes > 0;
}

export function deleteUser(userId: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  return result.changes > 0;
}

export function changePassword(userId: number, oldPassword: string, newPassword: string): { success: boolean; error?: string } {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as { password_hash: string } | undefined;
  if (!user) return { success: false, error: 'User not found' };
  if (!verifyPassword(oldPassword, user.password_hash)) return { success: false, error: 'Current password is incorrect' };
  const hash = hashPassword(newPassword);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, userId);
  return { success: true };
}
