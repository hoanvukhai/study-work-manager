// Múi giờ nghiệp vụ của ứng dụng (Việt Nam, UTC+7). Dùng cho mọi phép tính "theo ngày"
// ở backend (chuỗi ngày học, thống kê theo ngày, bản tin buổi sáng...).
export const APP_TIMEZONE_OFFSET_MIN = 420;

const DAY_MS = 24 * 3600 * 1000;

/** Khoá ngày YYYY-MM-DD theo giờ Việt Nam của một thời điểm. */
export function toLocalDateKey(d: Date): string {
  return new Date(d.getTime() + APP_TIMEZONE_OFFSET_MIN * 60000).toISOString().slice(0, 10);
}

/** Thời điểm 00:00 (giờ Việt Nam) của ngày chứa `d`, trả về dạng Date (UTC). */
export function startOfLocalDay(d: Date): Date {
  const shifted = d.getTime() + APP_TIMEZONE_OFFSET_MIN * 60000;
  const dayStartShifted = shifted - (((shifted % DAY_MS) + DAY_MS) % DAY_MS);
  return new Date(dayStartShifted - APP_TIMEZONE_OFFSET_MIN * 60000);
}

/** Lùi `n` ngày theo giờ Việt Nam và trả về khoá ngày. */
export function localDateKeyDaysAgo(now: Date, n: number): string {
  return toLocalDateKey(new Date(now.getTime() - n * DAY_MS));
}

/** 00:00 thứ Hai (giờ Việt Nam) của tuần chứa `d`, trả về dạng Date (UTC). Tuần bắt đầu từ thứ Hai. */
export function startOfLocalWeek(d: Date): Date {
  const dayStart = startOfLocalDay(d);
  const shifted = new Date(dayStart.getTime() + APP_TIMEZONE_OFFSET_MIN * 60000);
  const weekdayFromMonday = (shifted.getUTCDay() + 6) % 7; // T2 = 0 … CN = 6
  return new Date(dayStart.getTime() - weekdayFromMonday * DAY_MS);
}
