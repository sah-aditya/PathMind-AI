import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Renders AI-generated markdown content with proper formatting.
 * Supports bold, italic, lists, code, inline code, and line breaks.
 */
export default function MarkdownMessage({ content, className = '' }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={`prose-chat ${className}`}
      components={{
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>
        ),
        // Bold
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        // Italic
        em: ({ children }) => (
          <em className="italic opacity-90">{children}</em>
        ),
        // Unordered lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-0.5 my-1.5 pl-1">{children}</ul>
        ),
        // Ordered lists
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-0.5 my-1.5 pl-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        // Inline code
        code: ({ inline, children }) =>
          inline ? (
            <code className="px-1.5 py-0.5 rounded-md bg-black/8 text-brand-700 text-[0.82em] font-mono font-medium">
              {children}
            </code>
          ) : (
            <pre className="bg-surface-100 border border-surface-200 rounded-lg p-3 my-2 overflow-x-auto">
              <code className="text-xs font-mono text-text-primary leading-relaxed">{children}</code>
            </pre>
          ),
        // Headings
        h1: ({ children }) => (
          <h1 className="text-base font-bold text-text-primary mb-1 mt-2 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold text-text-primary mb-1 mt-2 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-text-primary mb-0.5 mt-1.5 first:mt-0">{children}</h3>
        ),
        // Tables
        table: ({ children }) => (
          <div className="overflow-x-auto my-2 rounded border border-surface-200">
            <table className="min-w-full text-xs text-left divide-y divide-surface-200">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-surface-100 font-bold text-slate-800">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-surface-200 bg-white">{children}</tbody>,
        tr: ({ children }) => <tr>{children}</tr>,
        th: ({ children }) => <th className="px-2.5 py-1.5 font-bold text-slate-900">{children}</th>,
        td: ({ children }) => <td className="px-2.5 py-1.5 text-slate-700">{children}</td>,
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-brand-500 pl-3 my-2 text-text-secondary italic">
            {children}
          </blockquote>
        ),
        // Horizontal rule
        hr: () => <hr className="border-surface-200 my-2" />,
        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
