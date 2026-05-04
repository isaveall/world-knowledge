import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getCategoryOrder, saveCategoryOrder, getAllDocuments } from '@/lib/documents';

export async function GET() {
  const order = getCategoryOrder();
  // Collect all unique category names from both languages
  const enDocs = getAllDocuments('en');
  const zhDocs = getAllDocuments('zh');
  const allNames = new Set<string>();
  for (const d of [...enDocs, ...zhDocs]) allNames.add(d.category);
  const available = Array.from(allNames).sort();
  return NextResponse.json({ order, available });
}

export async function PUT(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { order } = await request.json();
  if (!Array.isArray(order)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  if (saveCategoryOrder(order)) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
}
