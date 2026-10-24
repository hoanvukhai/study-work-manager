import { apiRequest } from './api';

export type NotificationType =
  | 'DEADLINE_SOON'
  | 'OVERDUE'
  | 'EVENT_SOON'
  | 'DAILY_DIGEST'
  | 'STUDY_DUE'
  | 'UNBLOCKED'
  | 'SYSTEM'
  | string;

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  objectId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationList {
  items: AppNotification[];
  unreadCount: number;
}

export interface NotificationSettings {
  remindBeforeMinutes: number;
  quietHoursEnabled: boolean;
  quietStartMinute: number;
  quietEndMinute: number;
  enableDeadline: boolean;
  enableOverdue: boolean;
  enableEvent: boolean;
  enableDigest: boolean;
  enableStudy: boolean;
  enableUnblocked: boolean;
}

export const getNotifications = (unreadOnly = false, limit = 50) =>
  apiRequest<NotificationList>(`/notifications?limit=${limit}${unreadOnly ? '&unreadOnly=true' : ''}`);
export const getUnreadCount = () => apiRequest<{ unreadCount: number }>('/notifications/unread-count');
export const markNotificationRead = (id: string) =>
  apiRequest<{ message: string }>(`/notifications/${id}/read`, { method: 'PATCH' });
export const markAllNotificationsRead = () =>
  apiRequest<{ updated: number }>('/notifications/read-all', { method: 'PATCH' });
export const deleteNotification = (id: string) =>
  apiRequest<{ message: string }>(`/notifications/${id}`, { method: 'DELETE' });
export const getNotificationSettings = () => apiRequest<NotificationSettings>('/notifications/settings');
export const updateNotificationSettings = (patch: Partial<NotificationSettings>) =>
  apiRequest<NotificationSettings>('/notifications/settings', { method: 'PATCH', body: JSON.stringify(patch) });
