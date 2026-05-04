import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const user = authenticateUser(username, password);
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken(user);

  const response = NextResponse.json({ user, token });
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
  });

  return response;
}
