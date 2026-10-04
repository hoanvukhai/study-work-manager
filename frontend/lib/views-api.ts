import { apiRequest } from './api';
import { AppObject } from './objects-api';
import { Space } from './spaces-api';

export interface KanbanResponse {
  todo: AppObject[];
  inProgress: AppObject[];
  done: AppObject[];
  counts: {
    todo: number;
    inProgress: number;
    done: number;
    total: number;
  };
}

export interface DashboardSummaryResponse {
  counts: {
    spacesTotal: number;
    tasksTotal: number;
    todo: number;
    inProgress: number;
    done: number;
    overdue: number;
    notesTotal: number;
    completionRate: number;
  };
  upcomingDeadlines: AppObject[];
  recentSpaces: (Space & { _count?: { spaceObjects: number } })[];
  recentTasks: AppObject[];
}

export async function getKanbanView(spaceId?: string): Promise<KanbanResponse> {
  const qs = spaceId ? `?spaceId=${spaceId}` : '';
  return apiRequest<KanbanResponse>(`/views/kanban${qs}`);
}

export async function getCalendarView(params?: {
  from?: string;
  to?: string;
  spaceId?: string;
}): Promise<AppObject[]> {
  const query = new URLSearchParams();
  if (params?.from) query.set('from', params.from);
  if (params?.to) query.set('to', params.to);
  if (params?.spaceId) query.set('spaceId', params.spaceId);

  const qs = query.toString();
  return apiRequest<AppObject[]>(`/views/calendar${qs ? `?${qs}` : ''}`);
}

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  return apiRequest<DashboardSummaryResponse>('/dashboard/summary');
}
