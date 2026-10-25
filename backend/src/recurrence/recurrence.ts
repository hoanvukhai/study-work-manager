// Luật lặp lại và tính lần xuất hiện kế tiếp — hàm thuần, tính theo giờ Việt Nam (UTC+7, không có giờ mùa hè).
import { APP_TIMEZONE_OFFSET_MIN } from '../common/timezone';

export type RecurrenceFreq = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface RecurrenceRule {
  freq: RecurrenceFreq;
  /** Cứ mỗi `interval` ngày / tuần / tháng. */
  interval: number;
  /** Ngày kết thúc lặp (ISO). Lần kế tiếp rơi sau mốc này thì không sinh nữa. */
  until?: string | null;
}

export const MAX_INTERVAL = 52;
/** Chặn vòng lặp khi bỏ lỡ rất lâu (ví dụ việc hằng ngày bị bỏ 1 năm). */
const MAX_STEPS = 400;
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

export function isValidRule(rule: unknown): rule is RecurrenceRule {
  if (!rule || typeof rule !== 'object') return false;
  const r = rule as Record<string, unknown>;
  return (
    (r.freq === 'DAILY' || r.freq === 'WEEKLY' || r.freq === 'MONTHLY') &&
    Number.isInteger(r.interval) &&
    (r.interval as number) >= 1 &&
    (r.interval as number) <= MAX_INTERVAL &&
    (r.until == null || (typeof r.until === 'string' && !Number.isNaN(new Date(r.until).getTime())))
  );
}

/** Cộng `n` tháng, giữ ngày trong tháng (kẹp về ngày cuối tháng: 31/1 + 1 tháng = 28 hoặc 29/2). */
function addMonthsLocal(date: Date, n: number): Date {
  const t = new Date(date.getTime() + APP_TIMEZONE_OFFSET_MIN * MINUTE); // sang "giờ treo tường" VN, đọc bằng UTC
  const day = t.getUTCDate();
  const target = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + n, 1, t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds()));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return new Date(target.getTime() - APP_TIMEZONE_OFFSET_MIN * MINUTE);
}

export function addOnce(base: Date, rule: RecurrenceRule): Date {
  if (rule.freq === 'DAILY') return new Date(base.getTime() + rule.interval * DAY);
  if (rule.freq === 'WEEKLY') return new Date(base.getTime() + rule.interval * 7 * DAY);
  return addMonthsLocal(base, rule.interval);
}

/**
 * Lần xuất hiện kế tiếp SAU `after` (mặc định là `base`): cộng dần theo luật từ `base`
 * cho tới khi vượt `after`, nhờ đó bỏ qua các lần đã lỡ. Trả null nếu vượt `until`.
 */
export function nextOccurrence(base: Date, rule: RecurrenceRule, after: Date = base): Date | null {
  const until = rule.until ? new Date(rule.until).getTime() : Infinity;
  let next = base;
  for (let i = 0; i < MAX_STEPS; i++) {
    next = addOnce(base, { ...rule, interval: rule.interval * (i + 1) });
    if (next.getTime() > after.getTime()) {
      return next.getTime() <= until ? next : null;
    }
  }
  return null;
}

export function describeRule(rule: RecurrenceRule): string {
  const unit = { DAILY: 'ngày', WEEKLY: 'tuần', MONTHLY: 'tháng' }[rule.freq];
  return rule.interval === 1 ? `Hằng ${unit}` : `Mỗi ${rule.interval} ${unit}`;
}
