'use client';

import React, { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { isoToLocalInput, localInputToIso } from '@/lib/datetime';
import type { Space, UpdateSpacePayload } from '@/lib/spaces-api';
import styles from './SpaceSettingsDialog.module.css';

interface Props {
  space: Space;
  open: boolean;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: UpdateSpacePayload) => void;
}

export const SPACE_TOOLS = [
  { key: 'enableKanban', label: 'Bảng Kanban', hint: 'Tab xem công việc theo cột trạng thái' },
  { key: 'enableCalendar', label: 'Lịch trình', hint: 'Tab xem công việc và sự kiện theo lịch' },
  { key: 'enableProgress', label: 'Thanh tiến độ', hint: 'Hiện % công việc đã xong trong Không gian' },
] as const;

/** Công cụ mặc định bật; chỉ tắt khi người dùng đặt rõ là false. */
export function toolEnabled(settings: Record<string, unknown> | undefined, key: string): boolean {
  return settings?.[key] !== false;
}

export default function SpaceSettingsDialog({ space, open, saving, onClose, onSave }: Props) {
  const [goal, setGoal] = useState('');
  const [due, setDue] = useState('');
  const [tools, setTools] = useState<Record<string, boolean>>({});

  // Nạp lại mỗi lần mở để không giữ giá trị chưa lưu của lần trước
  useEffect(() => {
    if (!open) return;
    setGoal(space.goal ?? '');
    setDue(isoToLocalInput(space.dueDate).slice(0, 10));
    setTools(Object.fromEntries(SPACE_TOOLS.map((t) => [t.key, toolEnabled(space.settings, t.key)])));
  }, [open, space]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      goal: goal.trim() || null,
      dueDate: due ? localInputToIso(`${due}T23:59`) : null,
      settings: tools,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cài đặt Không gian"
      description="Mục tiêu, hạn chót và những công cụ bạn muốn dùng trong Không gian này."
    >
      <form onSubmit={submit} className={styles.form}>
        <label className={styles.field}>
          Mục tiêu
          <textarea
            className={styles.textarea}
            maxLength={300}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="VD: Bảo vệ thành công đồ án tốt nghiệp"
          />
        </label>

        <label className={styles.field}>
          Hạn chót của Không gian
          <input className={styles.input} type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </label>

        <fieldset className={styles.tools}>
          <legend>Công cụ hiển thị</legend>
          {SPACE_TOOLS.map((t) => (
            <label key={t.key} className={styles.check}>
              <input
                type="checkbox"
                checked={tools[t.key] ?? true}
                onChange={(e) => setTools((prev) => ({ ...prev, [t.key]: e.target.checked }))}
              />
              <span>
                {t.label}
                <small>{t.hint}</small>
              </span>
            </label>
          ))}
          <div className={styles.note}>Danh sách và lưới luôn hiện. Tắt công cụ chỉ ẩn tab, không xoá dữ liệu.</div>
        </fieldset>

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            Lưu
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
