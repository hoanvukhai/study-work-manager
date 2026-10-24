// Chấm điểm và gợi ý "Hôm nay làm gì?" — hàm thuần, nhận `now` để test được.

export type PlanPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | null;
export type PlanStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' | null;

export interface PlanTask {
  id: string;
  title: string;
  status: PlanStatus;
  priority: PlanPriority;
  dueDate: Date | null;
  estimatedMinutes: number | null;
  /** Các việc tiền đề CHƯA xong mà việc này đang chờ. */
  blockedBy: { id: string; title: string }[];
  /** Số việc khác đang chờ việc này xong. */
  unblocksCount: number;
}

export interface ScoredTask {
  id: string;
  title: string;
  status: PlanStatus;
  priority: PlanPriority;
  dueDate: Date | null;
  estimatedMinutes: number | null;
  score: number;
  reasons: string[];
}

export interface PlanOverview {
  suggestions: ScoredTask[];
  blocked: { id: string; title: string; waitingFor: { id: string; title: string }[] }[];
  workload: {
    plannedMinutes: number;
    capacityMinutes: number;
    unestimatedCount: number;
    overloaded: boolean;
  };
}

/** Giả định mỗi ngày dành được 4 giờ cho việc trong kế hoạch; xét 7 ngày tới. */
export const DAILY_CAPACITY_MINUTES = 240;
export const WORKLOAD_WINDOW_DAYS = 7;
export const MAX_SUGGESTIONS = 5;

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

const PRIORITY_POINTS: Record<string, number> = { URGENT: 30, HIGH: 20, MEDIUM: 10, LOW: 0 };
const PRIORITY_LABEL: Record<string, string> = {
  URGENT: 'Mức ưu tiên khẩn cấp',
  HIGH: 'Mức ưu tiên cao',
};

export function scoreTask(task: PlanTask, now: Date): ScoredTask {
  let score = 0;
  const reasons: string[] = [];

  // 1) Độ gấp theo hạn chót
  if (!task.dueDate) {
    score += 10;
  } else {
    const diff = task.dueDate.getTime() - now.getTime();
    if (diff < 0) {
      const days = Math.max(1, Math.ceil(-diff / DAY));
      score += 100;
      reasons.push(`Đã quá hạn ${days} ngày`);
    } else if (diff <= DAY) {
      score += 80;
      reasons.push('Hạn chót trong 24 giờ tới');
    } else if (diff <= 3 * DAY) {
      score += 60;
      reasons.push('Hạn chót trong 3 ngày tới');
    } else if (diff <= 7 * DAY) {
      score += 40;
      reasons.push('Hạn chót trong tuần này');
    } else {
      score += 20;
    }
  }

  // 2) Mức ưu tiên
  score += PRIORITY_POINTS[task.priority ?? 'MEDIUM'] ?? 10;
  if (task.priority && PRIORITY_LABEL[task.priority]) reasons.push(PRIORITY_LABEL[task.priority]);

  // 3) Đang làm dở thì nên làm tiếp
  if (task.status === 'IN_PROGRESS') {
    score += 10;
    reasons.push('Đang làm dở');
  }

  // 4) Làm xong sẽ mở khoá việc khác
  if (task.unblocksCount > 0) {
    score += Math.min(15, 5 * task.unblocksCount);
    reasons.push(`Mở khoá ${task.unblocksCount} việc khác`);
  }

  return {
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    estimatedMinutes: task.estimatedMinutes,
    score,
    reasons,
  };
}

/** Tổng hợp gợi ý, danh sách việc bị chặn và mức tải 7 ngày tới. `tasks` chỉ gồm việc chưa xong. */
export function buildOverview(tasks: PlanTask[], now: Date): PlanOverview {
  const blocked = tasks
    .filter((t) => t.blockedBy.length > 0)
    .map((t) => ({ id: t.id, title: t.title, waitingFor: t.blockedBy }));

  const suggestions = tasks
    .filter((t) => t.blockedBy.length === 0)
    .map((t) => scoreTask(t, now))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const ad = a.dueDate ? a.dueDate.getTime() : Infinity;
      const bd = b.dueDate ? b.dueDate.getTime() : Infinity;
      return ad - bd;
    })
    .slice(0, MAX_SUGGESTIONS);

  const horizon = now.getTime() + WORKLOAD_WINDOW_DAYS * DAY;
  const inWindow = tasks.filter((t) => t.dueDate && t.dueDate.getTime() <= horizon);
  const plannedMinutes = inWindow.reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0);
  const capacityMinutes = DAILY_CAPACITY_MINUTES * WORKLOAD_WINDOW_DAYS;

  return {
    suggestions,
    blocked,
    workload: {
      plannedMinutes,
      capacityMinutes,
      unestimatedCount: inWindow.filter((t) => t.estimatedMinutes == null).length,
      overloaded: plannedMinutes > capacityMinutes,
    },
  };
}
