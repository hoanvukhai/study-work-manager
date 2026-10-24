'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDeleteNotification, useMarkAllRead, useMarkRead, useNotifications } from '@/hooks/useNotifications';
import NotificationItem from '@/components/notifications/NotificationItem';
import { destinationOf } from '@/components/notifications/NotificationBell';
import ObjectDetailDrawer from '@/components/objects/ObjectDetailDrawer';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { AppNotification } from '@/lib/notifications-api';
import styles from '@/components/notifications/Notifications.module.css';

export default function NotificationsPage() {
  const router = useRouter();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const { data, isLoading, isError } = useNotifications(unreadOnly, 100);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const del = useDeleteNotification();

  const open = (n: AppNotification) => {
    if (!n.isRead) markRead.mutate(n.id);
    const dest = destinationOf(n);
    if (dest.objectId) setDrawerId(dest.objectId);
    else if (dest.href) router.push(dest.href);
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Thông báo</h1>

      <div className={styles.pageBar}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant={unreadOnly ? 'outline' : 'primary'} size="sm" onClick={() => setUnreadOnly(false)}>
            Tất cả
          </Button>
          <Button variant={unreadOnly ? 'primary' : 'outline'} size="sm" onClick={() => setUnreadOnly(true)}>
            Chưa đọc{data ? ` (${data.unreadCount})` : ''}
          </Button>
        </div>
        <Button variant="ghost" size="sm" disabled={!data || data.unreadCount === 0} onClick={() => markAll.mutate()}>
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <div className={styles.pageList}>
        {isLoading && <Skeleton height={160} />}
        {isError && <div className={styles.empty}>Không tải được thông báo.</div>}
        {data && data.items.length === 0 && (
          <div className={styles.empty}>{unreadOnly ? 'Không còn thông báo chưa đọc.' : 'Chưa có thông báo nào.'}</div>
        )}
        {data?.items.map((n) => (
          <NotificationItem key={n.id} notification={n} onOpen={open} onDelete={(x) => del.mutate(x.id)} />
        ))}
      </div>

      <div className={styles.rowHint}>
        Chọn khi nào nhận thông báo và giờ yên lặng ở trang <a href="/profile" style={{ color: 'var(--primary-blue)' }}>Hồ sơ & Bảo mật</a>.
      </div>

      {drawerId && <ObjectDetailDrawer objectId={drawerId} onClose={() => setDrawerId(null)} onSelectObject={(id) => setDrawerId(id)} />}
    </div>
  );
}
