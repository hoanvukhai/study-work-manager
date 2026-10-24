'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAdminStats, getAdminUsers, getAuditLogs, lockUser, sendBroadcast, unlockUser } from '@/lib/admin-api';

const KEY = ['admin'];

export function useAdminUsers(search: string, page: number) {
  return useQuery({
    queryKey: [...KEY, 'users', search, page],
    queryFn: () => getAdminUsers(search, page),
    placeholderData: keepPreviousData,
  });
}

export function useAdminStats(enabled = true) {
  return useQuery({ queryKey: [...KEY, 'stats'], queryFn: getAdminStats, enabled });
}

export function useAuditLogs(enabled = true) {
  return useQuery({ queryKey: [...KEY, 'audit'], queryFn: getAuditLogs, enabled });
}

export function useSetLocked() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, locked }: { id: string; locked: boolean }) => (locked ? lockUser(id) : unlockUser(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ title, message }: { title: string; message: string }) => sendBroadcast(title, message),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, 'audit'] }),
  });
}
