// Hàm xử lý ngày giờ theo MÚI GIỜ CỦA NGƯỜI DÙNG.
// Không dùng toISOString().slice()/split() để hiển thị vì toISOString luôn trả giờ UTC
// (lệch 7 tiếng ở Việt Nam → hạn chót bị lùi mỗi lần lưu, lịch hiện sai ngày).

const pad = (n: number) => String(n).padStart(2, '0');

/** ISO từ server → giá trị cho <input type="datetime-local"> (giờ địa phương). */
export function isoToLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Giá trị <input type="datetime-local"> (giờ địa phương) → ISO UTC để gửi server. */
export function localInputToIso(value?: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Khoá ngày YYYY-MM-DD theo giờ địa phương của một Date. */
export function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Khoá ngày YYYY-MM-DD (giờ địa phương) của một chuỗi ISO từ server. */
export function isoToLocalDateKey(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : localDateKey(d);
}
