'use client';

import React, { useMemo, useRef, useState } from 'react';
import { activeMentionQuery, parseMentions } from '@/lib/mentions';
import styles from './Knowledge.module.css';

interface Candidate {
  id: string;
  title: string;
  type: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  candidates: Candidate[];
  /** Mục hiện tại (không gợi ý chính nó). */
  selfId?: string;
  onOpen?: (id: string) => void;
  className?: string;
  placeholder?: string;
}

const TYPE_ICON: Record<string, string> = { TASK: '✅', NOTE: '📝', EVENT: '📅', REFERENCE: '🔗' };

export default function LinkTextarea({ value, onChange, candidates, selfId, onOpen, className, placeholder }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [caret, setCaret] = useState(0);
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const mention = dismissed ? null : activeMentionQuery(value, caret);

  const suggestions = useMemo(() => {
    if (!mention) return [];
    const q = mention.query.trim().toLowerCase();
    return candidates
      .filter((c) => c.id !== selfId && (!q || c.title.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [mention, candidates, selfId]);

  const sync = () => {
    setCaret(ref.current?.selectionStart ?? 0);
    setDismissed(false);
  };

  const pick = (title: string) => {
    if (!mention) return;
    const before = value.slice(0, mention.start);
    const after = value.slice(caret);
    const insert = `[[${title}]]`;
    const next = before + insert + after;
    onChange(next);
    const pos = (before + insert).length;
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(pos, pos);
      setCaret(pos);
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!mention) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation(); // không đóng cả khung chi tiết
      setDismissed(true);
    } else if (suggestions.length > 0 && e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % suggestions.length);
    } else if (suggestions.length > 0 && e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
    } else if (suggestions.length > 0 && (e.key === 'Enter' || e.key === 'Tab')) {
      e.preventDefault();
      pick(suggestions[Math.min(active, suggestions.length - 1)].title);
    }
  };

  // Chip các mục được nhắc: có thật (bấm để mở) hoặc chưa có mục nào trùng tiêu đề
  const mentions = useMemo(() => {
    const byTitle = new Map(candidates.map((c) => [c.title.toLowerCase(), c]));
    return parseMentions(value).map((t) => ({ title: t, target: byTitle.get(t.toLowerCase()) }));
  }, [value, candidates]);

  return (
    <div className={styles.linkWrap}>
      <textarea
        ref={ref}
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setCaret(e.target.selectionStart);
          setDismissed(false);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        onKeyUp={(e) => {
          if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) sync();
        }}
        onClick={sync}
        onBlur={() => setTimeout(() => setDismissed(true), 150)}
      />

      {mention && (
        <div className={styles.suggest} role="listbox" aria-label="Gợi ý liên kết">
          {suggestions.length === 0 ? (
            <div className={styles.suggestEmpty}>Không có mục nào khớp “{mention.query}”.</div>
          ) : (
            suggestions.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={i === active}
                className={`${styles.suggestItem} ${i === active ? styles.suggestItemActive : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault(); // giữ focus ở ô gõ
                  pick(c.title);
                }}
              >
                <span>{TYPE_ICON[c.type] ?? '•'}</span>
                <span>{c.title}</span>
              </button>
            ))
          )}
        </div>
      )}

      {mentions.length > 0 && (
        <div className={styles.mentionRow}>
          <span>Liên kết trong nội dung:</span>
          {mentions.map((m) =>
            m.target ? (
              <button key={m.title} type="button" className={styles.mentionChip} onClick={() => onOpen?.(m.target!.id)}>
                {TYPE_ICON[m.target.type] ?? '•'} {m.target.title}
              </button>
            ) : (
              <span key={m.title} className={`${styles.mentionChip} ${styles.mentionMissing}`} title="Chưa có mục nào có tiêu đề này">
                {m.title}
              </span>
            ),
          )}
        </div>
      )}
    </div>
  );
}
