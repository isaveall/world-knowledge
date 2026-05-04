'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import ApiEndpoint from './ApiEndpoint';

interface MarkdownRendererProps {
  content: string;
  apiMethod?: string;
  apiPath?: string;
}

export default function MarkdownRenderer({ content, apiMethod, apiPath }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      {apiMethod && apiPath && <ApiEndpoint method={apiMethod} path={apiPath} />}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children }) {
            return <>{children}</>;
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            if (match) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }
            return <code {...props}>{children}</code>;
          },
          h2({ children, ...props }) {
            const text = String(children).replace(/[`*_~\[\]]/g, '');
            const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
            return <h2 id={id} {...props}>{children}</h2>;
          },
          h3({ children, ...props }) {
            const text = String(children).replace(/[`*_~\[\]]/g, '');
            const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
            return <h3 id={id} {...props}>{children}</h3>;
          },
          h4({ children, ...props }) {
            const text = String(children).replace(/[`*_~\[\]]/g, '');
            const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
            return <h4 id={id} {...props}>{children}</h4>;
          },
          table({ children, ...props }) {
            return (
              <div className="overflow-x-auto">
                <table {...props}>{children}</table>
              </div>
            );
          },
          th({ children, ...props }) {
            return <th {...props}>{children}</th>;
          },
          td({ children, ...props }) {
            return <td {...props}>{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
