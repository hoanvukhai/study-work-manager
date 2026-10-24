'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { AppNotification } from '@/lib/notifications-api';
import styles from './Notifications.module.css';

const ICON: Record<string, string> = {
  DEADLINE_SOON: '⏰',
  OVERDUE: '🔥',
  EVENT_SOON: '📅',
  DAILY_DIGEST: '☀️',
  STUDY_DUE: '📚',
  UNBLOCKED: '🔓',
  SYSTEM: '📢',
};

export function timeAgo(iso: string): string {
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffMin < 24 * 60) return `${Math.round(diffMin / 60)} giờ trước`;
  return `${Math.round(diffMin / (24 * 60))} ngày trước`;
}

interface Props {
  notification: AppNotification;
  onOpen: (n: AppNotification) => void;
  onDelete: (n: AppNotification) => void;
}

export default function NotificationItem({ notification: n, onOpen, onDelete }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch' }} className={`${styles.item} ${n.isRead ? '' : styles.itemUnread}`}>
      <button
        type="button"
        onClick={() => onOpen(n)}
        style={{ display: 'flex', gap: 10, flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
      >
        <span className={styles.icon}>{ICON[n.type] ?? '🔔'}</span>
        <span className={styles.itemBody}>
          <div className={styles.itemTitle}>{n.title}</div>
          <div className={styles.itemMsg}>{n.message}</div>
          <div className={styles.itemTime}>{timeAgo(n.createdAt)}</div>
        </span>
      </button>
      <button type="button" className={styles.delBtn} aria-label="Xoá thông báo" onClick={() => onDelete(n)}>
        <X size={14} />
      </button>
    </div>
  );
}
