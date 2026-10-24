// Tách các nhắc tới `[[Tiêu đề]]` trong nội dung — hàm thuần.

export const MAX_MENTIONS = 50;
export const MAX_MENTION_LENGTH = 255;

/**
 * Trả về danh sách tiêu đề được nhắc tới (đã cắt khoảng trắng, bỏ trùng không phân biệt hoa thường,
 * giữ thứ tự xuất hiện đầu tiên). Bỏ qua `[[]]` rỗng, `[[ ]]`, và ngoặc không đóng.
 */
export function parseMentions(text: string | null | undefined): string[] {
  if (!text) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  const re = /\[\[([^\[\]\n]+?)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const title = m[1].trim();
    if (!title || title.length > MAX_MENTION_LENGTH) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(title);
    if (out.length >= MAX_MENTIONS) break;
  }
  return out;
}
