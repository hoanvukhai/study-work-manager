'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createStudySession,
  getDueCards,
  getNoteCards,
  getStudyStats,
  reviewCard,
  syncNoteCards,
  Grade,
} from '@/lib/study-api';

export const STUDY_QUERY_KEY = ['study'];

export function useDueCards(limit = 20) {
  return useQuery({ queryKey: [...STUDY_QUERY_KEY, 'due', limit], queryFn: () => getDueCards(limit) });
}

export function useStudyStats() {
  return useQuery({ queryKey: [...STUDY_QUERY_KEY, 'stats'], queryFn: getStudyStats });
}

export function useNoteCards(objectId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: [...STUDY_QUERY_KEY, 'cards', objectId],
    queryFn: () => getNoteCards(objectId as string),
    enabled: Boolean(objectId) && enabled,
  });
}

export function useSyncCards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (objectId: string) => syncNoteCards(objectId),
    onSuccess: () => qc.invalidateQueries({ queryKey: STUDY_QUERY_KEY }),
  });
}

export function useReviewCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, grade }: { id: string; grade: Grade }) => reviewCard(id, grade),
    // Không làm mới danh sách ngay: phiên ôn đang chạy trên hàng đợi đã tải về
    onSuccess: () => qc.invalidateQueries({ queryKey: [...STUDY_QUERY_KEY, 'stats'] }),
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ minutes, objectId }: { minutes: number; objectId?: string }) =>
      createStudySession(minutes, objectId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...STUDY_QUERY_KEY, 'stats'] }),
  });
}
