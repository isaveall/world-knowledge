import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserFromRequest, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const currentUser = getUserFromRequest(request);
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { username, password, role } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const user = createUser(username, password, role || 'viewer');
  if (!user) {
    return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
  }

  const token = signToken(user);
  return NextResponse.json({ user, token });
}
