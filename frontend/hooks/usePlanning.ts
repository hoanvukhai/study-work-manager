'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPlanOverview } from '@/lib/planning-api';

export const PLANNING_QUERY_KEY = ['planning'];

export function usePlanOverview() {
  return useQuery({
    queryKey: PLANNING_QUERY_KEY,
    queryFn: getPlanOverview,
  });
}

/** Tập id các việc đang bị chặn bởi việc khác (để hiện 🔒 trên thẻ). */
export function useBlockedIds(): Set<string> {
  const { data } = usePlanOverview();
  return useMemo(() => new Set((data?.blocked ?? []).map((b) => b.id)), [data]);
}
