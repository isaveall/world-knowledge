import { NextRequest, NextResponse } from 'next/server';
import { getAllDocuments, createDocument } from '@/lib/documents';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang') || 'en';
  const docs = getAllDocuments(lang);
  return NextResponse.json({ documents: docs });
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { slug, title, category, order, tags, api_method, api_path, content, lang } = body;

  if (!slug || !title || !content) {
    return NextResponse.json({ error: 'slug, title, and content are required' }, { status: 400 });
  }

  const success = createDocument(slug, {
    title, category, order, tags, api_method, api_path,
  }, content, lang || 'en');

  if (!success) {
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }

  // Save to history
  const db = getDb();
  const filePath = `content/docs/${lang || 'en'}/${slug}.md`;
  const maxVersion = db.prepare(
    'SELECT MAX(version) as v FROM document_history WHERE file_path = ?'
  ).get(filePath) as { v: number | null };
  const version = (maxVersion?.v || 0) + 1;
  db.prepare(
    'INSERT INTO document_history (file_path, content, edited_by, version) VALUES (?, ?, ?, ?)'
  ).run(filePath, content, user.id, version);

  return NextResponse.json({ success: true, slug });
}
