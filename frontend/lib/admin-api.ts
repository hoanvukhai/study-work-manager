import { apiRequest } from './api';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  lastLoginAt: string | null;
  lockedAt: string | null;
  spacesCount: number;
  objectsCount: number;
}

export interface AdminUserList {
  total: number;
  page: number;
  pageSize: number;
  items: AdminUser[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsers7d: number;
  lockedUsers: number;
  spacesTotal: number;
  flashcardsTotal: number;
  objectsByType: Record<string, number>;
  last14Days: { date: string; newUsers: number; newObjects: number }[];
}

export interface AuditLog {
  id: string;
  action: string;
  detail: string;
  createdAt: string;
  adminEmail: string;
  targetEmail: string | null;
}

export const getAdminUsers = (search: string, page: number, pageSize = 15) => {
  const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (search.trim()) q.set('search', search.trim());
  return apiRequest<AdminUserList>(`/admin/users?${q.toString()}`);
};
export const lockUser = (id: string) => apiRequest(`/admin/users/${id}/lock`, { method: 'PATCH' });
export const unlockUser = (id: string) => apiRequest(`/admin/users/${id}/unlock`, { method: 'PATCH' });
export const getAdminStats = () => apiRequest<AdminStats>('/admin/stats');
export const getAuditLogs = () => apiRequest<AuditLog[]>('/admin/audit-logs');
export const sendBroadcast = (title: string, message: string) =>
  apiRequest<{ recipients: number }>('/admin/broadcast', { method: 'POST', body: JSON.stringify({ title, message }) });
