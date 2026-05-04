import { NextRequest, NextResponse } from 'next/server';
import { searchDocuments } from '@/lib/search';
import { Lang } from '@/lib/i18n';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || '';
  const lang = (request.nextUrl.searchParams.get('lang') || 'en') as Lang;
  const results = searchDocuments(q, lang);
  return NextResponse.json({ results });
}
