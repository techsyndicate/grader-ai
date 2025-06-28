'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { formatRelativeTime } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/lib/store';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-black text-sm font-medium flex-shrink-0">
          AI
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`rounded-lg p-4 ${
            isUser
              ? 'bg-[var(--accent)] text-black ml-auto'
              : 'bg-[var(--card)] border border-[var(--border)] text-white'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              className="prose prose-invert max-w-none"
              components={{
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isCodeBlock = match && !props.inline;

                  if (isCodeBlock) {
                    return (
                      <SyntaxHighlighter
                        style={oneDark as any}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md !bg-gray-900 !text-sm"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  }

                  return (
                    <code
                      className="bg-[var(--secondary)] text-[var(--accent)] px-2 py-1 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre({ children }) {
                  return <div className="overflow-x-auto">{children}</div>;
                },
                p({ children }) {
                  return (
                    <p className="mb-2 last:mb-0 text-white">{children}</p>
                  );
                },
                ul({ children }) {
                  return (
                    <ul className="list-disc pl-6 mb-2 text-white">
                      {children}
                    </ul>
                  );
                },
                ol({ children }) {
                  return (
                    <ol className="list-decimal pl-6 mb-2 text-white">
                      {children}
                    </ol>
                  );
                },
                li({ children }) {
                  return <li className="mb-1 text-white">{children}</li>;
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-4 border-[var(--accent)] pl-4 italic my-2 text-[var(--text-light)]">
                      {children}
                    </blockquote>
                  );
                },
                h1({ children }) {
                  return (
                    <h1 className="text-xl font-bold mb-2 text-white">
                      {children}
                    </h1>
                  );
                },
                h2({ children }) {
                  return (
                    <h2 className="text-lg font-bold mb-2 text-white">
                      {children}
                    </h2>
                  );
                },
                h3({ children }) {
                  return (
                    <h3 className="text-base font-bold mb-2 text-white">
                      {children}
                    </h3>
                  );
                },
                strong({ children }) {
                  return (
                    <strong className="font-semibold text-[var(--accent)]">
                      {children}
                    </strong>
                  );
                },
                em({ children }) {
                  return (
                    <em className="italic text-[var(--text-light)]">
                      {children}
                    </em>
                  );
                },
                a({ children, href }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent)] hover:underline"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        <div
          className={`text-xs text-[var(--text-muted)] mt-1 ${isUser ? 'text-right' : ''}`}
        >
          {formatRelativeTime(message.timestamp)}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] text-sm font-medium flex-shrink-0">
          U
        </div>
      )}
    </div>
  );
}
