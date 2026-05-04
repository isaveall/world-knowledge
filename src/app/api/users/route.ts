import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, updateUserRole, deleteUser, getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const users = getAllUsers();
  return NextResponse.json({ users });
}

export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { userId, role } = await request.json();
  if (!userId || !role) {
    return NextResponse.json({ error: 'userId and role are required' }, { status: 400 });
  }

  const success = updateUserRole(userId, role);
  if (!success) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  // Prevent self-deletion
  if (userId === user.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  }

  const success = deleteUser(userId);
  if (!success) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
