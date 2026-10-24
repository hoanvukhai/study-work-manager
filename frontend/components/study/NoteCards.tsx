'use client';

import React from 'react';
import { useNoteCards, useSyncCards } from '@/hooks/useStudy';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import styles from './Study.module.css';

interface Props {
  noteId: string;
  /** Nội dung đang sửa chưa lưu → phải lưu trước khi tạo thẻ (thẻ lấy từ bản đã lưu). */
  dirty: boolean;
}

function dueLabel(iso: string): string {
  const diffMin = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (diffMin <= 0) return 'Cần ôn';
  if (diffMin < 60) return `Sau ${diffMin} phút`;
  if (diffMin < 24 * 60) return `Sau ${Math.round(diffMin / 60)} giờ`;
  return `Sau ${Math.round(diffMin / (24 * 60))} ngày`;
}

export default function NoteCards({ noteId, dirty }: Props) {
  const { data: cards = [] } = useNoteCards(noteId);
  const syncMutation = useSyncCards();
  const toast = useToast();

  const handleSync = async () => {
    try {
      const r = await syncMutation.mutateAsync(noteId);
      toast.success(
        r.total === 0
          ? 'Không tìm thấy dòng "Câu hỏi :: Trả lời" nào'
          : `Đã đồng bộ ${r.total} thẻ (mới ${r.created}, cập nhật ${r.updated}, xoá ${r.removed})`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không tạo được thẻ ôn tập');
    }
  };

  return (
    <div className={styles.noteCards}>
      <div className={styles.noteCardsHint}>
        Viết mỗi thẻ trên một dòng: <code>Câu hỏi :: Trả lời</code>. Thẻ nào không còn trong nội dung sẽ bị xoá khi đồng bộ.
      </div>
      <div>
        <Button variant="outline" size="sm" onClick={handleSync} disabled={dirty || syncMutation.isPending}>
          {cards.length ? 'Đồng bộ thẻ ôn tập' : 'Tạo thẻ ôn tập'}
        </Button>
        {dirty && <span className={styles.noteCardsHint}> Hãy lưu thay đổi trước.</span>}
      </div>
      {cards.map((c) => (
        <div key={c.id} className={styles.noteCardItem}>
          <span>
            {c.front} → {c.back}
          </span>
          <span className={styles.noteCardDue}>{dueLabel(c.dueAt)}</span>
        </div>
      ))}
    </div>
  );
}
