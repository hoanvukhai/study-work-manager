import { apiRequest } from './api';

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  isCurrentWeek: boolean;
  tasks: {
    completed: number;
    created: number;
    dueInWeek: number;
    dueAndDone: number;
    dueNotDone: number;
    onTimeRate: number | null;
  };
  study: {
    reviews: number;
    retentionRate: number | null;
    minutes: number;
    activeDays: number;
  };
  days: { date: string; tasksCompleted: number; reviews: number; minutes: number }[];
  topSpaces: { id: string; name: string; icon: string; completed: number }[];
  vsPreviousWeek: { tasksCompleted: number; reviews: number; minutes: number };
}

export const getWeeklyReport = (offset: number) => apiRequest<WeeklyReport>(`/reports/weekly?offset=${offset}`);
