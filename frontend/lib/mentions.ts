// Bản sao phía giao diện của backend/src/knowledge/mentions.ts: tách [[Tiêu đề]] trong nội dung.
export function parseMentions(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const re = /\[\[([^\[\]\n]+?)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const title = m[1].trim();
    if (!title || title.length > 255) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(title);
  }
  return out;
}

/** Nếu con trỏ đang nằm trong `[[...` chưa đóng thì trả về vị trí bắt đầu và chuỗi đang gõ. */
export function activeMentionQuery(text: string, caret: number): { start: number; query: string } | null {
  const before = text.slice(0, caret);
  const start = before.lastIndexOf('[[');
  if (start < 0) return null;
  const query = before.slice(start + 2);
  if (query.includes(']') || query.includes('\n')) return null;
  return { start, query };
}
