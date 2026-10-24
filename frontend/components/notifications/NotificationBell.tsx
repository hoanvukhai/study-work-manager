'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import {
  useDeleteNotification,
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from '@/hooks/useNotifications';
import type { AppNotification } from '@/lib/notifications-api';
import ObjectDetailDrawer from '@/components/objects/ObjectDetailDrawer';
import NotificationItem from './NotificationItem';
import headerStyles from '../layout/Header.module.css';
import styles from './Notifications.module.css';

/** Mở nơi liên quan tới thông báo: mục cụ thể → khung chi tiết; ôn tập → /study; còn lại → Tổng quan. */
export function destinationOf(n: AppNotification): { objectId?: string; href?: string } {
  if (n.objectId) return { objectId: n.objectId };
  if (n.type === 'STUDY_DUE') return { href: '/study' };
  if (n.type === 'DAILY_DIGEST') return { href: '/' };
  return {};
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data: unread } = useUnreadCount();
  const { data } = useNotifications(false, 10, open);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const del = useDeleteNotification();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const count = unread?.unreadCount ?? 0;

  const handleOpen = (n: AppNotification) => {
    if (!n.isRead) markRead.mutate(n.id);
    setOpen(false);
    const dest = destinationOf(n);
    if (dest.objectId) setDrawerId(dest.objectId);
    else if (dest.href) router.push(dest.href);
  };

  return (
    <div className={styles.bellWrap} ref={wrapRef}>
      <button
        type="button"
        className={`${headerStyles.iconBtn} ${styles.bellBtn}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={count > 0 ? `Thông báo, ${count} chưa đọc` : 'Thông báo'}
        aria-expanded={open}
        title="Thông báo"
      >
        <Bell size={18} />
        {count > 0 && <span className={styles.badge}>{count > 99 ? '99+' : count}</span>}
      </button>

      {open && (
        <div className={styles.dropdown} role="dialog" aria-label="Danh sách thông báo">
          <div className={styles.dropHeader}>
            <span>Thông báo</span>
            {count > 0 && (
              <button type="button" className={styles.linkBtn} onClick={() => markAll.mutate()}>
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          <div className={styles.dropList}>
            {data && data.items.length === 0 && <div className={styles.empty}>Chưa có thông báo nào 🎉</div>}
            {data?.items.map((n) => (
              <NotificationItem key={n.id} notification={n} onOpen={handleOpen} onDelete={(x) => del.mutate(x.id)} />
            ))}
          </div>
          <div className={styles.dropFooter}>
            <Link href="/notifications" className={styles.linkBtn} onClick={() => setOpen(false)}>
              Xem tất cả
            </Link>
          </div>
        </div>
      )}

      {drawerId && (
        <ObjectDetailDrawer objectId={drawerId} onClose={() => setDrawerId(null)} onSelectObject={(id) => setDrawerId(id)} />
      )}
    </div>
  );
}
