import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDocument, getSidebarCategories, getAdjacentDocs, extractToc, decodeSlug } from '@/lib/documents';
import { Lang } from '@/lib/i18n';
import Sidebar from '@/components/Sidebar';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import TableOfContents from '@/components/TableOfContents';
import ThemeToggle from '@/components/ThemeToggle';
import SearchDialog from '@/components/SearchDialog';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Link from 'next/link';

interface DocsPageProps {
  params: Promise<{ slug?: string[] }>;
}

function processSlug(segments: string[] | undefined): string {
  if (!segments || segments.length === 0) return 'getting-started/introduction';
  // Decode each segment and join
  return segments.map(s => decodeSlug(s)).join('/');
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug } = await params;
  const slugStr = processSlug(slug);

  // Read language from cookie
  const cookieStore = await cookies();
  const lang: Lang = (cookieStore.get('lang')?.value === 'zh' ? 'zh' : 'en');

  const doc = getDocument(slugStr, lang);
  if (!doc) notFound();

  const categories = getSidebarCategories(lang);
  const toc = extractToc(doc.content);
  const adjacent = getAdjacentDocs(slugStr, lang);

  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      en: { docs: 'Docs', admin: 'Admin', updatedAt: 'Last updated' },
      zh: { docs: '文档', admin: '管理', updatedAt: '最后更新' },
    };
    return translations[lang]?.[key] || key;
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar categories={categories} lang={lang} />

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-6 py-3">
            <nav className="flex items-center gap-2 text-base text-gray-500 dark:text-gray-400 min-w-0">
              <Link href="/" className="shrink-0 hover:text-gray-900 dark:hover:text-gray-200">{t('docs')}</Link>
              {doc.category && (
                <>
                  <span className="shrink-0">/</span>
                  <span className="truncate text-gray-600 dark:text-gray-300">{doc.category}</span>
                </>
              )}
              <span className="shrink-0">/</span>
              <span className="text-gray-900 dark:text-white font-medium truncate">{doc.title}</span>
            </nav>
            <div className="flex items-center gap-3">
              <SearchDialog lang={lang} />
              <LanguageSwitcher />
              <Link
                href="/admin"
                className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                {t('admin')}
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 flex">
          <div className="flex-1 min-w-0 px-10 py-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {doc.title}
              </h1>
              {doc.tags.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {doc.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <MarkdownRenderer
              content={doc.content}
              apiMethod={doc.api_method}
              apiPath={doc.api_path}
            />

            {/* Previous / Next navigation */}
            {(adjacent.prev || adjacent.next) && (
              <div className="mt-12 flex gap-x-6">
                <div className="flex-1 min-w-0">
                  {adjacent.prev ? (
                    <Link
                      href={`/docs/${adjacent.prev.slug}`}
                      className="group flex flex-col px-5 py-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        ← {lang === 'zh' ? '上一篇' : 'Previous'}
                      </span>
                      <span className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {adjacent.prev.title}
                      </span>
                    </Link>
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  {adjacent.next ? (
                    <Link
                      href={`/docs/${adjacent.next.slug}`}
                      className="group flex flex-col px-5 py-4 rounded-lg border border-gray-300 dark:border-gray-700 text-right hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {lang === 'zh' ? '下一篇' : 'Next'} →
                      </span>
                      <span className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {adjacent.next.title}
                      </span>
                    </Link>
                  ) : null}
                </div>
              </div>
            )}

            {doc.updatedAt && (
              <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 text-base text-gray-400">
                {t('updatedAt')}: {new Date(doc.updatedAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            )}

            <div className="mt-8 pt-4 pb-2 text-center text-base text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-800">
              Copyright &copy; 2026 iSaveall, 骏九文化 Inc.
            </div>
          </div>

          <TableOfContents items={toc} lang={lang} />
        </main>
      </div>
    </div>
  );
}
