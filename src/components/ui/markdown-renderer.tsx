import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                children={String(children).replace(/\n$/, '')}
                style={oneLight as any}
                language={match[1]}
                PreTag="div"
                className="rounded-xl border border-border shadow-sm text-[13px] !bg-zinc-50/50"
              />
            ) : (
              <code {...props} className="bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded text-[13px] font-mono">
                {children}
              </code>
            )
          },
          h1: ({ children }) => <h1 className="text-xl font-bold tracking-tight mb-4 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold tracking-tight mb-3 mt-6 text-foreground border-b border-border pb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-md font-semibold tracking-tight mb-2 mt-4 text-foreground">{children}</h3>,
          p: ({ children }) => <p className="mb-4 leading-relaxed text-muted-foreground">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-4 text-muted-foreground space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 text-muted-foreground space-y-1">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{children}</a>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground bg-primary/5 py-2 pr-4 rounded-r-lg">{children}</blockquote>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
