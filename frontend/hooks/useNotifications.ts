'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteNotification,
  getNotificationSettings,
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationSettings,
  NotificationSettings,
} from '@/lib/notifications-api';

export const NOTIFICATIONS_KEY = ['notifications'];

/** Số chưa đọc: tự làm mới mỗi 60 giây, tạm dừng khi tab bị ẩn. */
export function useUnreadCount() {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'unread'],
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}

export function useNotifications(unreadOnly = false, limit = 50, enabled = true) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'list', unreadOnly, limit],
    queryFn: () => getNotifications(unreadOnly, limit),
    enabled,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
}

export function useMarkRead() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => markNotificationRead(id), onSuccess: invalidate });
}

export function useMarkAllRead() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: markAllNotificationsRead, onSuccess: invalidate });
}

export function useDeleteNotification() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => deleteNotification(id), onSuccess: invalidate });
}

export function useNotificationSettings() {
  return useQuery({ queryKey: [...NOTIFICATIONS_KEY, 'settings'], queryFn: getNotificationSettings });
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<NotificationSettings>) => updateNotificationSettings(patch),
    onSuccess: (data) => qc.setQueryData([...NOTIFICATIONS_KEY, 'settings'], data),
  });
}
