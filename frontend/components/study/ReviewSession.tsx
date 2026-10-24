'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BookOpenCheck } from 'lucide-react';
import { useDueCards, useReviewCard } from '@/hooks/useStudy';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import type { Grade } from '@/lib/study-api';
import styles from './Study.module.css';

const GRADES: { grade: Grade; label: string; className: string }[] = [
  { grade: 'AGAIN', label: 'Quên', className: styles.gradeAgain },
  { grade: 'HARD', label: 'Khó', className: styles.gradeHard },
  { grade: 'GOOD', label: 'Nhớ', className: styles.gradeGood },
  { grade: 'EASY', label: 'Dễ', className: styles.gradeEasy },
];

export function formatInterval(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  if (minutes < 24 * 60) return `${Math.round(minutes / 60)} giờ`;
  const days = Math.round(minutes / (24 * 60));
  if (days < 30) return `${days} ngày`;
  return `${Math.round(days / 30)} tháng`;
}

export default function ReviewSession() {
  const { data, isLoading, isError, refetch } = useDueCards(20);
  const reviewMutation = useReviewCard();
  const toast = useToast();

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const cards = data?.cards ?? [];
  const card = cards[index];

  const grade = useCallback(
    async (g: Grade) => {
      if (!card || reviewMutation.isPending) return;
      try {
        await reviewMutation.mutateAsync({ id: card.id, grade: g });
        setReviewed((n) => n + 1);
        setRevealed(false);
        setIndex((i) => i + 1);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Không lưu được kết quả ôn');
      }
    },
    [card, reviewMutation, toast],
  );

  // Phím tắt: Space/Enter = hiện đáp án; 1–4 = chấm
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || !card) return;
      if (!revealed && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && ['1', '2', '3', '4'].includes(e.key)) {
        grade(GRADES[Number(e.key) - 1].grade);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [card, revealed, grade]);

  const startAgain = async () => {
    setIndex(0);
    setRevealed(false);
    setReviewed(0);
    await refetch();
  };

  return (
    <section className={styles.panel} aria-label="Ôn tập thẻ">
      <div className={styles.panelTitle}>
        <BookOpenCheck size={18} color="var(--primary-blue)" />
        Ôn tập
      </div>

      {isLoading && <Skeleton height={180} />}
      {isError && <div className={styles.done}>Không tải được thẻ ôn tập.</div>}

      {data && data.totalCards === 0 && (
        <div className={styles.done}>
          <div className={styles.doneEmoji}>🗂️</div>
          Chưa có thẻ nào. Mở một Ghi chú, viết các dòng dạng <b>Câu hỏi :: Trả lời</b> rồi bấm “Tạo thẻ ôn tập”.
        </div>
      )}

      {data && data.totalCards > 0 && !card && (
        <div className={styles.done}>
          <div className={styles.doneEmoji}>🎉</div>
          {reviewed > 0 ? `Xong! Bạn đã ôn ${reviewed} thẻ.` : 'Hôm nay không còn thẻ nào cần ôn.'}
          <div style={{ marginTop: 12 }}>
            <Button variant="outline" size="sm" onClick={startAgain}>
              Kiểm tra lại thẻ đến hạn
            </Button>
          </div>
        </div>
      )}

      {card && (
        <>
          <div className={styles.progressRow}>
            <span>
              {index + 1}/{cards.length}
              {data && data.dueCount > cards.length ? ` (còn ${data.dueCount - cards.length} thẻ nữa)` : ''}
            </span>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${(index / cards.length) * 100}%` }} />
            </div>
          </div>

          <div className={styles.cardFace}>
            <div className={styles.cardMeta}>
              <span className={styles.chip}>{card.noteTitle}</span>
              {card.isNew && <span className={styles.chip}>Thẻ mới</span>}
              {card.contextReason && <span className={`${styles.chip} ${styles.chipContext}`}>{card.contextReason}</span>}
            </div>
            <div className={styles.cardLabel}>Câu hỏi</div>
            <div className={styles.cardText}>{card.front}</div>
            {revealed && <div className={styles.cardAnswer}>{card.back}</div>}
          </div>

          {!revealed ? (
            <>
              <Button variant="primary" onClick={() => setRevealed(true)}>
                Hiện đáp án
              </Button>
              <div className={styles.hint}>Phím tắt: Space</div>
            </>
          ) : (
            <>
              <div className={styles.gradeRow}>
                {GRADES.map((g, i) => (
                  <button
                    key={g.grade}
                    type="button"
                    className={`${styles.gradeBtn} ${g.className}`}
                    disabled={reviewMutation.isPending}
                    onClick={() => grade(g.grade)}
                  >
                    {g.label}
                    <small>{formatInterval(card.previewMinutes[g.grade])}</small>
                    <small>({i + 1})</small>
                  </button>
                ))}
              </div>
              <div className={styles.hint}>Số dưới tên nút là lần ôn kế tiếp</div>
            </>
          )}
        </>
      )}
    </section>
  );
}
