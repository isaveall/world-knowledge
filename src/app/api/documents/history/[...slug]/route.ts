import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const slugStr = slug.join('/');
  const db = getDb();

  const history = db.prepare(`
    SELECT h.*, u.username
    FROM document_history h
    LEFT JOIN users u ON h.edited_by = u.id
    WHERE h.file_path = ?
    ORDER BY h.version DESC
    LIMIT 50
  `).all(`content/docs/${slugStr}.md`);

  return NextResponse.json({ history });
}
