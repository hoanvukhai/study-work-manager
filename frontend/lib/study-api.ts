import { apiRequest } from './api';

export type Grade = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export interface DueCard {
  id: string;
  front: string;
  back: string;
  noteId: string;
  noteTitle: string;
  isNew: boolean;
  contextReason: string | null;
  /** Số phút tới lần ôn kế tiếp ứng với từng mức chấm. */
  previewMinutes: Record<Grade, number>;
  dueAt: string;
}

export interface DueResponse {
  dueCount: number;
  totalCards: number;
  cards: DueCard[];
}

export interface StudyStats {
  dueNow: number;
  totalCards: number;
  reviewedToday: number;
  minutesToday: number;
  minutesWeek: number;
  streakDays: number;
  last7Days: { date: string; reviews: number; minutes: number }[];
}

export interface NoteCard {
  id: string;
  front: string;
  back: string;
  dueAt: string;
  intervalDays: number;
  repetitions: number;
}

export interface SyncResult {
  created: number;
  updated: number;
  removed: number;
  total: number;
}

export const getDueCards = (limit = 20) => apiRequest<DueResponse>(`/study/due?limit=${limit}`);
export const getStudyStats = () => apiRequest<StudyStats>('/study/stats');
export const getNoteCards = (objectId: string) => apiRequest<NoteCard[]>(`/study/notes/${objectId}/cards`);
export const syncNoteCards = (objectId: string) =>
  apiRequest<SyncResult>(`/study/notes/${objectId}/sync-cards`, { method: 'POST' });
export const reviewCard = (id: string, grade: Grade) =>
  apiRequest<{ id: string; intervalDays: number; dueAt: string }>(`/study/cards/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ grade }),
  });
export const createStudySession = (minutes: number, objectId?: string) =>
  apiRequest<{ id: string; minutes: number }>('/study/sessions', {
    method: 'POST',
    body: JSON.stringify({ minutes, ...(objectId ? { objectId } : {}) }),
  });
