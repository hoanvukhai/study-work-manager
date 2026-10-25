'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './Markdown.module.css';

interface Props {
  text: string;
  /** Tìm id mục theo tiêu đề (không phân biệt hoa thường) để biến [[Tiêu đề]] thành liên kết bấm được. */
  resolve?: (title: string) => string | undefined;
  onOpen?: (id: string) => void;
}

const OBJ_PREFIX = '#obj:';

/**
 * Hiển thị Markdown an toàn: react-markdown KHÔNG render HTML thô (chống XSS) và tự lọc các
 * liên kết nguy hiểm như javascript:. [[Tiêu đề]] được đổi thành liên kết nội bộ trước khi render.
 */
export default function MarkdownView({ text, resolve, onOpen }: Props) {
  const source = useMemo(
    () =>
      text.replace(/\[\[([^\[\]\n]+?)\]\]/g, (_m, raw: string) => {
        const title = raw.trim();
        const id = resolve?.(title);
        // Tiêu đề có thể chứa ký tự đặc biệt của Markdown → thoát trước khi đặt vào [ ]
        const label = title.replace(/([\\\[\]])/g, '\\$1');
        return id ? `[${label}](${OBJ_PREFIX}${id})` : `*${label}*`;
      }),
    [text, resolve],
  );

  if (!text.trim()) return <div className={styles.empty}>Chưa có nội dung.</div>;

  return (
    <div className={styles.md}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith(OBJ_PREFIX)) {
              const id = href.slice(OBJ_PREFIX.length);
              return (
                <button type="button" className={styles.internalLink} onClick={() => onOpen?.(id)}>
                  {children}
                </button>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer nofollow">
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
