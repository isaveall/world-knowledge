'use client';

import React, { useState } from 'react';
import { Highlight, themes, type Language } from 'prism-react-renderer';

// Custom GitHub Light theme
const githubLight = {
  ...themes.github,
  plain: {
    ...themes.github.plain,
    backgroundColor: '#ffffff',
    color: '#24292e',
  },
  styles: [
    ...themes.github.styles,
  ],
};

// Custom GitHub Dark theme
const githubDark = {
  plain: {
    color: '#e6edf3',
    backgroundColor: 'transparent',
  } as const,
  styles: [
    { types: ['keyword', 'selector-tag', 'type', 'selector-id'], style: { color: '#ff7b72' } },
    { types: ['string', 'addition', 'attribute', 'attr-value', 'template-string'], style: { color: '#a5d6ff' } },
    { types: ['number', 'literal', 'boolean'], style: { color: '#79c0ff' } },
    { types: ['comment', 'quote'], style: { color: '#8b949e', fontStyle: 'italic' as const } },
    { types: ['builtin', 'builtin-name'], style: { color: '#d2a8ff' } },
    { types: ['variable', 'template-variable'], style: { color: '#ffa657' } },
    { types: ['function', 'class-name', 'symbol'], style: { color: '#d2a8ff' } },
    { types: ['attr-name', 'property'], style: { color: '#79c0ff' } },
    { types: ['tag'], style: { color: '#ff7b72' } },
    { types: ['punctuation'], style: { color: '#e6edf3' } },
    { types: ['operator'], style: { color: '#ff7b72' } },
    { types: ['regex', 'regexp'], style: { color: '#a5d6ff' } },
    { types: ['deleted'], style: { color: '#f85149' } },
    { types: ['inserted'], style: { color: '#3fb950' } },
    { types: ['important', 'bold'], style: { fontWeight: 'bold' as const } },
    { types: ['italic'], style: { fontStyle: 'italic' as const } },
    { types: ['entity', 'url'], style: { color: '#79c0ff' } },
  ],
};

export default function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Check dark mode on mount and changes
  React.useEffect(() => {
    const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const lang = (className?.replace(/language-/, '') || '') as Language;
  const code = extractText(children);
  const theme = isDark ? githubDark : githubLight;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Map common language aliases
  const langMap: Record<string, Language> = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'sh': 'bash',
    'shell': 'bash',
    'curl': 'bash',
  };
  const prismLang = langMap[lang] || lang;

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
      {/* Header bar — GitHub-style */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
          {lang && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-mono uppercase">
              {lang}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="px-2 py-1 text-xs rounded-md bg-gray-200 dark:bg-gray-900 text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </span>
          )}
        </button>
      </div>

      {/* Code content with syntax highlighting */}
      <Highlight code={code.trimEnd()} language={prismLang as Language} theme={theme}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="m-0 p-4 overflow-x-auto text-sm leading-relaxed bg-white dark:bg-gray-900 font-mono">
            <code>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return extractText(props.children);
  }
  return '';
}
