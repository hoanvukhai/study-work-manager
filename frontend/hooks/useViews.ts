'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getKanbanView,
  getCalendarView,
  getDashboardSummary,
} from '@/lib/views-api';

export function useKanban(spaceId?: string) {
  return useQuery({
    queryKey: ['kanban', spaceId],
    queryFn: () => getKanbanView(spaceId),
  });
}

export function useCalendar(params?: { from?: string; to?: string; spaceId?: string }) {
  return useQuery({
    queryKey: ['calendar', params],
    queryFn: () => getCalendarView(params),
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardSummary(),
  });
}
