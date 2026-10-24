// Thuật toán SM-2 (SuperMemo-2, Piotr Woźniak, 1987) — nền tảng của Anki.
// Hàm thuần: nhận trạng thái thẻ + điểm tự chấm + thời điểm hiện tại, trả trạng thái mới.

export type Grade = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

/** Điểm chất lượng q (0–5) của SM-2 tương ứng với 4 mức người dùng tự chấm. */
export const GRADE_QUALITY: Record<Grade, number> = {
  AGAIN: 1, // Quên
  HARD: 3, // Khó nhớ
  GOOD: 4, // Nhớ
  EASY: 5, // Dễ
};

export const MIN_EASE = 1.3;
export const DEFAULT_EASE = 2.5;
/** Thẻ bị quên sẽ hiện lại sau 10 phút trong cùng phiên ôn. */
export const RELEARN_MINUTES = 10;

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

export interface CardState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface ReviewResult extends CardState {
  dueAt: Date;
}

export function reviewCard(state: CardState, grade: Grade, now: Date): ReviewResult {
  const q = GRADE_QUALITY[grade];

  // Quên (q < 3): học lại từ đầu, giữ nguyên hệ số dễ
  if (q < 3) {
    return {
      easeFactor: state.easeFactor,
      intervalDays: 1,
      repetitions: 0,
      dueAt: new Date(now.getTime() + RELEARN_MINUTES * MINUTE),
    };
  }

  // SM-2 gốc: cập nhật hệ số dễ (EF) trước, rồi dùng EF mới để tính khoảng cách
  const easeFactor = Math.max(
    MIN_EASE,
    state.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  );

  let intervalDays: number;
  if (state.repetitions === 0) intervalDays = 1;
  else if (state.repetitions === 1) intervalDays = 6;
  else intervalDays = Math.round(state.intervalDays * easeFactor);

  return {
    easeFactor,
    intervalDays,
    repetitions: state.repetitions + 1,
    dueAt: new Date(now.getTime() + intervalDays * DAY),
  };
}

/** Số phút tới lần ôn kế tiếp với từng mức chấm — để hiện trên nút ("10 phút", "6 ngày"...). */
export function previewMinutes(state: CardState, now: Date): Record<Grade, number> {
  const out = {} as Record<Grade, number>;
  (Object.keys(GRADE_QUALITY) as Grade[]).forEach((g) => {
    out[g] = Math.round((reviewCard(state, g, now).dueAt.getTime() - now.getTime()) / MINUTE);
  });
  return out;
}
