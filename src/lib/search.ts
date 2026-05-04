import { getAllDocuments, getDocument } from './documents';
import { SearchResult } from './types';
import { Lang } from './i18n';

export function searchDocuments(query: string, lang: Lang = 'en'): SearchResult[] {
  if (!query || query.trim().length === 0) return [];

  const docs = getAllDocuments(lang);
  const results: SearchResult[] = [];
  const q = query.toLowerCase();

  for (const doc of docs) {
    const fullDoc = getDocument(doc.slug, lang);
    if (!fullDoc) continue;

    const titleMatch = doc.title.toLowerCase().includes(q);
    const contentMatch = fullDoc.content.toLowerCase().includes(q);
    const categoryMatch = doc.category.toLowerCase().includes(q);
    const tagsMatch = doc.tags.some(t => t.toLowerCase().includes(q));
    const pathMatch = doc.api_path?.toLowerCase().includes(q);

    if (titleMatch || contentMatch || categoryMatch || tagsMatch || pathMatch) {
      let excerpt = '';
      if (contentMatch) {
        const idx = fullDoc.content.toLowerCase().indexOf(q);
        const start = Math.max(0, idx - 60);
        const end = Math.min(fullDoc.content.length, idx + q.length + 60);
        excerpt = (start > 0 ? '...' : '') +
          fullDoc.content.slice(start, end).replace(/\n/g, ' ').trim() +
          (end < fullDoc.content.length ? '...' : '');
      } else {
        excerpt = fullDoc.content.slice(0, 120).replace(/\n/g, ' ').trim() + '...';
      }

      results.push({
        slug: doc.slug,
        title: doc.title,
        category: doc.category,
        excerpt,
        api_method: doc.api_method,
        api_path: doc.api_path,
      });
    }
  }

  return results;
}
