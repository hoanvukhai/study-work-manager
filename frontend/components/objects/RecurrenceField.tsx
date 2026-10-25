'use client';

import React from 'react';
import { Repeat } from 'lucide-react';
import { isoToLocalInput, localInputToIso } from '@/lib/datetime';

export interface RecurrenceValue {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  until?: string | null;
}

interface Props {
  value: RecurrenceValue | null;
  onChange: (next: RecurrenceValue | null) => void;
  /** Lặp cần có hạn chót (Task) hoặc giờ bắt đầu (Event). */
  hasDate: boolean;
  noun: string; // "công việc" | "sự kiện"
}

const FREQ_LABEL = { DAILY: 'ngày', WEEKLY: 'tuần', MONTHLY: 'tháng' } as const;

const box: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 8,
  border: '1px solid var(--border-subtle)',
  background: 'var(--surface)',
  color: 'var(--text-primary)',
  fontSize: 13,
};

export default function RecurrenceField({ value, onChange, hasDate, noun }: Props) {
  const untilDay = isoToLocalInput(value?.until).slice(0, 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Repeat size={14} color="var(--text-secondary)" aria-hidden />
        <select
          aria-label="Kiểu lặp lại"
          style={box}
          value={value?.freq ?? ''}
          disabled={!hasDate && !value}
          onChange={(e) => {
            const freq = e.target.value as RecurrenceValue['freq'] | '';
            onChange(freq ? { freq, interval: value?.interval ?? 1, until: value?.until ?? null } : null);
          }}
        >
          <option value="">Không lặp lại</option>
          <option value="DAILY">Hằng ngày</option>
          <option value="WEEKLY">Hằng tuần</option>
          <option value="MONTHLY">Hằng tháng</option>
        </select>

        {value && (
          <>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>mỗi</span>
            <input
              aria-label="Khoảng lặp"
              type="number"
              min={1}
              max={52}
              style={{ ...box, width: 64 }}
              value={value.interval}
              onChange={(e) => onChange({ ...value, interval: Math.min(52, Math.max(1, Number(e.target.value) || 1)) })}
            />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{FREQ_LABEL[value.freq]}</span>
          </>
        )}
      </div>

      {value && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
          Lặp đến hết ngày
          <input
            type="date"
            style={box}
            value={untilDay}
            onChange={(e) => onChange({ ...value, until: e.target.value ? localInputToIso(`${e.target.value}T23:59`) : null })}
          />
          <span>(để trống = lặp mãi)</span>
        </label>
      )}

      {!hasDate && !value && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Đặt {noun === 'công việc' ? 'hạn chót' : 'giờ bắt đầu'} trước để bật lặp lại.
        </div>
      )}
      {value && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {noun === 'công việc'
            ? 'Khi đánh dấu xong, hệ thống tự tạo lần kế tiếp (bỏ qua các lần đã lỡ).'
            : 'Sau khi sự kiện bắt đầu, hệ thống tự tạo lần kế tiếp.'}
        </div>
      )}
    </div>
  );
}
