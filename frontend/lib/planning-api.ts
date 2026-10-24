import { apiRequest } from './api';
import type { Priority, TaskStatus } from './objects-api';

export interface PlanSuggestion {
  id: string;
  title: string;
  status: TaskStatus | null;
  priority: Priority | null;
  dueDate: string | null;
  estimatedMinutes: number | null;
  score: number;
  reasons: string[];
}

export interface PlanBlockedItem {
  id: string;
  title: string;
  waitingFor: { id: string; title: string }[];
}

export interface PlanOverview {
  suggestions: PlanSuggestion[];
  blocked: PlanBlockedItem[];
  workload: {
    plannedMinutes: number;
    capacityMinutes: number;
    unestimatedCount: number;
    overloaded: boolean;
  };
}

export function getPlanOverview(): Promise<PlanOverview> {
  return apiRequest<PlanOverview>('/planning/overview');
}
