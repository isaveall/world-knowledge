import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Document, DocumentMeta, DocumentListItem, SidebarCategory, SidebarItem, TocItem } from './types';

function getDocsDir(lang: string = 'en'): string {
  return path.join(process.cwd(), 'content', 'docs', lang);
}

export function ensureDocsDir(lang: string = 'en') {
  const dir = getDocsDir(lang);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getAllDocuments(lang: string = 'en'): DocumentListItem[] {
  const DOCS_DIR = getDocsDir(lang);
  ensureDocsDir(lang);
  const docs: DocumentListItem[] = [];

  function walkDir(dir: string, prefix: string = '') {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath, prefix ? `${prefix}/${entry.name}` : entry.name);
      } else if (entry.name.endsWith('.md')) {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const { data } = matter(raw);
        const slug = prefix ? `${prefix}/${entry.name.replace(/\.md$/, '')}` : entry.name.replace(/\.md$/, '');
        const stat = fs.statSync(fullPath);
        docs.push({
          title: data.title || entry.name.replace(/\.md$/, ''),
          slug,
          category: data.category || 'Uncategorized',
          order: data.order ?? 999,
          tags: data.tags || [],
          api_method: data.api_method,
          api_path: data.api_path,
          updatedAt: stat.mtime.toISOString(),
        });
      }
    }
  }

  walkDir(DOCS_DIR);
  docs.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.order - b.order;
  });
  return docs;
}

export function getDocument(slug: string, lang: string = 'en'): Document | null {
  const DOCS_DIR = getDocsDir(lang);
  ensureDocsDir(lang);
  const filePath = path.join(DOCS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const stat = fs.statSync(filePath);

  return {
    title: data.title || slug.split('/').pop() || '',
    slug,
    category: data.category || 'Uncategorized',
    order: data.order ?? 999,
    tags: data.tags || [],
    api_method: data.api_method,
    api_path: data.api_path,
    content,
    filePath,
    updatedAt: stat.mtime.toISOString(),
  };
}

export function getAdjacentDocs(slug: string, lang: string = 'en'): { prev: SidebarItem | null; next: SidebarItem | null } {
  const categories = getSidebarCategories(lang);
  for (const cat of categories) {
    const idx = cat.items.findIndex(item => item.slug === slug);
    if (idx !== -1) {
      return {
        prev: idx > 0 ? cat.items[idx - 1] : null,
        next: idx < cat.items.length - 1 ? cat.items[idx + 1] : null,
      };
    }
  }
  return { prev: null, next: null };
}

export function getSidebarCategories(lang: string = 'en'): SidebarCategory[] {
  const docs = getAllDocuments(lang);
  const categoryMap = new Map<string, SidebarCategory>();

  for (const doc of docs) {
    if (!categoryMap.has(doc.category)) {
      categoryMap.set(doc.category, { name: doc.category, items: [] });
    }
    categoryMap.get(doc.category)!.items.push({
      title: doc.title,
      slug: doc.slug,
      order: doc.order,
      api_method: doc.api_method,
    });
  }

  const categories = Array.from(categoryMap.values());
  const catOrder = getCategoryOrder();
  if (catOrder.length > 0) {
    const orderMap = new Map(catOrder.map((name, idx) => [name, idx]));
    categories.sort((a, b) => {
      const ai = orderMap.get(a.name);
      const bi = orderMap.get(b.name);
      if (ai !== undefined && bi !== undefined) return ai - bi;
      if (ai !== undefined) return -1;
      if (bi !== undefined) return 1;
      return a.name.localeCompare(b.name);
    });
  }
  return categories;
}

export function extractToc(content: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{2,4})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[`*_~\[\]]/g, '');
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
      items.push({ id, text, level });
    }
  }
  return items;
}

export function createDocument(slug: string, frontmatter: Partial<DocumentMeta>, content: string, lang: string = 'en'): boolean {
  const DOCS_DIR = getDocsDir(lang);
  ensureDocsDir(lang);
  const filePath = path.join(DOCS_DIR, `${slug}.md`);
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const fm: Record<string, unknown> = {
    title: frontmatter.title || '',
    category: frontmatter.category || 'Uncategorized',
    order: frontmatter.order ?? 999,
    tags: frontmatter.tags || [],
  };
  if (frontmatter.api_method) fm.api_method = frontmatter.api_method;
  if (frontmatter.api_path) fm.api_path = frontmatter.api_path;

  const fileContent = matter.stringify(content, fm);
  fs.writeFileSync(filePath, fileContent, 'utf-8');
  return true;
}

export function updateDocument(slug: string, frontmatter: Partial<DocumentMeta>, content: string, lang: string = 'en'): boolean {
  const DOCS_DIR = getDocsDir(lang);
  const filePath = path.join(DOCS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return false;
  return createDocument(slug, frontmatter, content, lang);
}

export function deleteDocument(slug: string, lang: string = 'en'): boolean {
  const DOCS_DIR = getDocsDir(lang);
  const filePath = path.join(DOCS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

export function renameDocument(oldSlug: string, newSlug: string, lang: string = 'en'): boolean {
  const DOCS_DIR = getDocsDir(lang);
  const oldPath = path.join(DOCS_DIR, `${oldSlug}.md`);
  const newPath = path.join(DOCS_DIR, `${newSlug}.md`);
  if (!fs.existsSync(oldPath)) return false;
  const newDir = path.dirname(newPath);
  if (!fs.existsSync(newDir)) {
    fs.mkdirSync(newDir, { recursive: true });
  }
  fs.renameSync(oldPath, newPath);
  return true;
}

// URL helper: encode each segment of a slug for safe URL usage
export function encodeSlug(slug: string): string {
  return slug.split('/').map(encodeURIComponent).join('/');
}

// URL helper: decode a URL-encoded slug
export function decodeSlug(slug: string): string {
  return slug.split('/').map(decodeURIComponent).join('/');
}

const CATEGORY_CONFIG_PATH = path.join(process.cwd(), 'content', 'categories.json');

export function getCategoryOrder(): string[] {
  try {
    if (fs.existsSync(CATEGORY_CONFIG_PATH)) {
      const raw = fs.readFileSync(CATEGORY_CONFIG_PATH, 'utf-8');
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    }
  } catch { /* ignore */ }
  return [];
}

export function saveCategoryOrder(categories: string[]): boolean {
  try {
    const dir = path.dirname(CATEGORY_CONFIG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CATEGORY_CONFIG_PATH, JSON.stringify(categories, null, 2), 'utf-8');
    return true;
  } catch { return false; }
}
