import { buildCalendar, escapeText, foldLine, formatUtc } from './ics';

describe('iCalendar (.ics)', () => {
  it('thoát ký tự đặc biệt: \\ ; , và xuống dòng', () => {
    expect(escapeText('a;b,c\\d\ne')).toBe('a\\;b\\,c\\\\d\\ne');
  });

  it('định dạng thời gian UTC', () => {
    expect(formatUtc(new Date('2026-10-26T03:05:09.000Z'))).toBe('20261026T030509Z');
  });

  it('gấp dòng dài: mỗi dòng ≤ 75 octet, dòng nối bắt đầu bằng dấu cách, ghép lại không mất ký tự', () => {
    const line = 'SUMMARY:' + 'Hoàn thiện báo cáo đồ án tốt nghiệp '.repeat(5);
    const folded = foldLine(line);
    const parts = folded.split('\r\n');
    expect(parts.length).toBeGreaterThan(1);
    for (const p of parts) expect(Buffer.byteLength(p, 'utf8')).toBeLessThanOrEqual(75);
    for (const p of parts.slice(1)) expect(p.startsWith(' ')).toBe(true);
    expect(parts[0] + parts.slice(1).map((p) => p.slice(1)).join('')).toBe(line);
  });

  it('dòng ngắn không bị gấp', () => {
    expect(foldLine('SUMMARY:Ngắn')).toBe('SUMMARY:Ngắn');
  });

  it('lịch có cấu trúc hợp lệ: VCALENDAR/VEVENT/VALARM, kết thúc bằng CRLF, kết thúc mặc định +30 phút', () => {
    const ics = buildCalendar(
      'Study & Work',
      [{ uid: 'abc@x', summary: 'Nộp báo cáo, chương 2', start: new Date('2026-10-26T03:00:00.000Z'), alarmMinutes: 30 }],
      new Date('2026-10-25T00:00:00.000Z'),
    );
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('UID:abc@x');
    expect(ics).toContain('DTSTART:20261026T030000Z');
    expect(ics).toContain('DTEND:20261026T033000Z');
    expect(ics).toContain('SUMMARY:Nộp báo cáo\\, chương 2');
    expect(ics).toContain('TRIGGER:-PT30M');
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics.match(/END:VEVENT/g)).toHaveLength(1);
    expect(ics.includes('\n') && ics.split('\n').every((l, i, a) => i === a.length - 1 || l.endsWith('\r'))).toBe(true);
  });

  it('sự kiện có giờ kết thúc hợp lệ thì dùng giờ đó; kết thúc không sau bắt đầu thì dùng +30 phút', () => {
    const s = new Date('2026-10-26T03:00:00.000Z');
    const ok = buildCalendar('x', [{ uid: '1', summary: 'a', start: s, end: new Date(s.getTime() + 2 * 3600000) }]);
    expect(ok).toContain('DTEND:20261026T050000Z');
    const bad = buildCalendar('x', [{ uid: '2', summary: 'a', start: s, end: new Date(s.getTime() - 3600000) }]);
    expect(bad).toContain('DTEND:20261026T033000Z');
  });

  it('không có sự kiện vẫn là lịch hợp lệ', () => {
    const ics = buildCalendar('x', []);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).not.toContain('BEGIN:VEVENT');
  });
});
