// Tách thẻ hỏi–đáp từ nội dung Note và tính chuỗi ngày học — các hàm thuần.

export interface ParsedCard {
  front: string;
  back: string;
}

export const MAX_FRONT = 500;
export const MAX_BACK = 2000;

/**
 * Mỗi dòng dạng `Câu hỏi :: Trả lời` (có thể bắt đầu bằng `-` hoặc `*`) là một thẻ.
 * Dòng không có `::`, hoặc thiếu một vế thì bỏ qua. Trùng câu hỏi thì dòng sau thắng.
 */
export function parseCards(text: string | null | undefined): ParsedCard[] {
  if (!text) return [];
  const byFront = new Map<string, string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^\s*(?:[-*+]\s+)?/, '');
    const idx = line.indexOf('::');
    if (idx < 0) continue;
    const front = line.slice(0, idx).trim();
    const back = line.slice(idx + 2).trim();
    if (!front || !back) continue;
    byFront.set(front.slice(0, MAX_FRONT), back.slice(0, MAX_BACK));
  }
  return [...byFront.entries()].map(([front, back]) => ({ front, back }));
}

/**
 * Chuỗi ngày học liên tiếp. Hôm nay chưa học thì chuỗi vẫn giữ đến hết ngày
 * (tính từ hôm qua); lỡ cả hôm qua thì chuỗi về 0.
 */
export function computeStreak(activeDays: Set<string>, todayKey: string): number {
  const dayBefore = (key: string) => {
    const d = new Date(`${key}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  };

  let cursor = activeDays.has(todayKey) ? todayKey : dayBefore(todayKey);
  let streak = 0;
  while (activeDays.has(cursor)) {
    streak += 1;
    cursor = dayBefore(cursor);
  }
  return streak;
}
