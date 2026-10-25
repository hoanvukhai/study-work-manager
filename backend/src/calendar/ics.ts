// Tạo file lịch iCalendar (RFC 5545) — hàm thuần, dễ kiểm thử.

export interface IcsEvent {
  uid: string;
  summary: string;
  start: Date;
  end?: Date | null;
  /** Nhắc trước khi bắt đầu (phút); bỏ trống = không có nhắc. */
  alarmMinutes?: number | null;
}

const CRLF = '\r\n';

/** Thoát ký tự đặc biệt trong giá trị văn bản theo RFC 5545 mục 3.3.11. */
export function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** 20261026T030000Z */
export function formatUtc(d: Date): string {
  const p = (n: number, l = 2) => String(n).padStart(l, '0');
  return `${p(d.getUTCFullYear(), 4)}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

/** Gấp dòng dài hơn 75 octet (đếm theo byte UTF-8, không cắt giữa ký tự); dòng nối tiếp bắt đầu bằng một dấu cách. */
export function foldLine(line: string): string {
  const parts: string[] = [];
  let current = '';
  let bytes = 0;
  let limit = 75;
  for (const ch of line) {
    const b = Buffer.byteLength(ch, 'utf8');
    if (bytes + b > limit) {
      parts.push(current);
      current = ' ';
      bytes = 1;
      limit = 75;
    }
    current += ch;
    bytes += b;
  }
  parts.push(current);
  return parts.join(CRLF);
}

export function buildCalendar(name: string, events: IcsEvent[], now: Date = new Date()): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Study Work Manager//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(name)}`,
    'X-PUBLISHED-TTL:PT1H',
  ];

  for (const e of events) {
    const end = e.end && e.end.getTime() > e.start.getTime() ? e.end : new Date(e.start.getTime() + 30 * 60000);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}`,
      `DTSTAMP:${formatUtc(now)}`,
      `DTSTART:${formatUtc(e.start)}`,
      `DTEND:${formatUtc(end)}`,
      `SUMMARY:${escapeText(e.summary)}`,
    );
    if (e.alarmMinutes != null) {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escapeText(e.summary)}`, `TRIGGER:-PT${e.alarmMinutes}M`, 'END:VALARM');
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join(CRLF) + CRLF;
}
