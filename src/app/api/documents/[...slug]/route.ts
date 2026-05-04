import { NextRequest, NextResponse } from 'next/server';
import { getDocument, updateDocument, deleteDocument, renameDocument } from '@/lib/documents';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const slugStr = slug.join('/');
  const lang = request.nextUrl.searchParams.get('lang') || 'en';
  const doc = getDocument(slugStr, lang);
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }
  return NextResponse.json(doc);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const user = getUserFromRequest(request);
  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const slugStr = slug.join('/');
  const body = await request.json();
  const { title, category, order, tags, api_method, api_path, content, newSlug, lang } = body;
  const langParam = lang || 'en';

  // If slug changed, rename first
  if (newSlug && newSlug !== slugStr) {
    renameDocument(slugStr, newSlug, langParam);
  }

  const targetSlug = newSlug || slugStr;
  const success = updateDocument(targetSlug, {
    title, category, order, tags, api_method, api_path,
  }, content, langParam);

  if (!success) {
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }

  // Save to history
  const db = getDb();
  const filePath = `content/docs/${langParam}/${targetSlug}.md`;
  const maxVersion = db.prepare(
    'SELECT MAX(version) as v FROM document_history WHERE file_path = ?'
  ).get(filePath) as { v: number | null };
  const version = (maxVersion?.v || 0) + 1;
  db.prepare(
    'INSERT INTO document_history (file_path, content, edited_by, version) VALUES (?, ?, ?, ?)'
  ).run(filePath, content, user.id, version);

  return NextResponse.json({ success: true, slug: targetSlug });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const slugStr = slug.join('/');
  const lang = request.nextUrl.searchParams.get('lang') || 'en';
  const success = deleteDocument(slugStr, lang);

  if (!success) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
