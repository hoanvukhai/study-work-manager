// Luật thuần của hệ thống thông báo (không đụng CSDL) → dễ kiểm thử.
import { APP_TIMEZONE_OFFSET_MIN } from '../common/timezone';

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

/** Quá hạn lâu hơn mức này thì thôi không nhắc nữa (tránh ngập thông báo cũ). */
export const OVERDUE_GRACE_DAYS = 7;

/** Số phút trong ngày (0–1439) theo giờ Việt Nam. */
export function localMinuteOfDay(now: Date): number {
  const t = now.getTime() + APP_TIMEZONE_OFFSET_MIN * MINUTE;
  return Math.floor((((t % DAY) + DAY) % DAY) / MINUTE);
}

/** Khoảng yên lặng có thể vắt qua nửa đêm (ví dụ 23:00 → 07:00). */
export function isInQuietHours(now: Date, enabled: boolean, startMinute: number, endMinute: number): boolean {
  if (!enabled || startMinute === endMinute) return false;
  const m = localMinuteOfDay(now);
  return startMinute < endMinute ? m >= startMinute && m < endMinute : m >= startMinute || m < endMinute;
}

export type DueClass = 'SOON' | 'OVERDUE' | null;

/** Hạn chót rơi vào "sắp đến hạn", "đã quá hạn", hay chưa cần nhắc. */
export function classifyDue(due: Date, now: Date, remindBeforeMinutes: number): DueClass {
  const diff = due.getTime() - now.getTime();
  if (diff > 0 && diff <= remindBeforeMinutes * MINUTE) return 'SOON';
  if (diff <= 0 && -diff <= OVERDUE_GRACE_DAYS * DAY) return 'OVERDUE';
  return null;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "HH:mm dd/MM" theo giờ Việt Nam. */
export function formatVn(d: Date): string {
  const t = new Date(d.getTime() + APP_TIMEZONE_OFFSET_MIN * MINUTE);
  return `${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())} ${pad(t.getUTCDate())}/${pad(t.getUTCMonth() + 1)}`;
}

/** "còn 3 giờ", "còn 25 phút", "đã trễ 2 ngày". */
export function describeDistance(due: Date, now: Date): string {
  const diff = due.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const text =
    abs < 60 * MINUTE
      ? `${Math.max(1, Math.round(abs / MINUTE))} phút`
      : abs < DAY
      ? `${Math.round(abs / (60 * MINUTE))} giờ`
      : `${Math.round(abs / DAY)} ngày`;
  return diff > 0 ? `còn ${text}` : `đã trễ ${text}`;
}
