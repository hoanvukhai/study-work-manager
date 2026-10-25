import { describeRule, isValidRule, nextOccurrence } from './recurrence';

// 10:00 giờ VN thứ Hai 26/10/2026 = 03:00 UTC
const BASE = new Date('2026-10-26T03:00:00.000Z');
const DAY = 24 * 3600 * 1000;

describe('nextOccurrence (lần lặp kế tiếp)', () => {
  it('hằng ngày / mỗi N ngày / hằng tuần', () => {
    expect(nextOccurrence(BASE, { freq: 'DAILY', interval: 1 })!.getTime()).toBe(BASE.getTime() + DAY);
    expect(nextOccurrence(BASE, { freq: 'DAILY', interval: 3 })!.getTime()).toBe(BASE.getTime() + 3 * DAY);
    expect(nextOccurrence(BASE, { freq: 'WEEKLY', interval: 1 })!.toISOString()).toBe('2026-11-02T03:00:00.000Z');
    expect(nextOccurrence(BASE, { freq: 'WEEKLY', interval: 2 })!.toISOString()).toBe('2026-11-09T03:00:00.000Z');
  });

  it('hằng tháng giữ nguyên ngày; kẹp về ngày cuối tháng khi tháng sau ngắn hơn', () => {
    expect(nextOccurrence(BASE, { freq: 'MONTHLY', interval: 1 })!.toISOString()).toBe('2026-11-26T03:00:00.000Z');
    // 31/01 10:00 VN → 28/02 (2027 không nhuận)
    const jan31 = new Date('2027-01-31T03:00:00.000Z');
    expect(nextOccurrence(jan31, { freq: 'MONTHLY', interval: 1 })!.toISOString()).toBe('2027-02-28T03:00:00.000Z');
    // 29/01/2028 + 1 tháng → 29/02/2028 (năm nhuận)
    expect(nextOccurrence(new Date('2028-01-29T03:00:00.000Z'), { freq: 'MONTHLY', interval: 1 })!.toISOString()).toBe('2028-02-29T03:00:00.000Z');
  });

  it('qua ranh giới năm; việc lúc 23:30 VN không trượt sang ngày khác', () => {
    const dec = new Date('2026-12-15T16:30:00.000Z'); // 23:30 VN ngày 15/12
    expect(nextOccurrence(dec, { freq: 'MONTHLY', interval: 1 })!.toISOString()).toBe('2027-01-15T16:30:00.000Z'); // vẫn 23:30 VN ngày 15/01
  });

  it('bỏ qua các lần đã lỡ: lấy lần đầu tiên sau mốc `after`', () => {
    const after = new Date(BASE.getTime() + 10 * DAY + 3600000); // đã trễ hơn 10 ngày
    const next = nextOccurrence(BASE, { freq: 'DAILY', interval: 1 }, after)!;
    expect(next.getTime()).toBe(BASE.getTime() + 11 * DAY);
    expect(next.getTime()).toBeGreaterThan(after.getTime());
  });

  it('dừng khi vượt ngày kết thúc (until), bao gồm đúng ngày kết thúc', () => {
    const rule = { freq: 'WEEKLY' as const, interval: 1, until: '2026-11-02T03:00:00.000Z' };
    expect(nextOccurrence(BASE, rule)!.toISOString()).toBe('2026-11-02T03:00:00.000Z'); // đúng until vẫn được
    expect(nextOccurrence(new Date('2026-11-02T03:00:00.000Z'), rule)).toBeNull();
  });
});

describe('isValidRule', () => {
  it('chấp nhận luật hợp lệ', () => {
    expect(isValidRule({ freq: 'DAILY', interval: 1 })).toBe(true);
    expect(isValidRule({ freq: 'MONTHLY', interval: 52, until: '2027-01-01T00:00:00.000Z' })).toBe(true);
    expect(isValidRule({ freq: 'WEEKLY', interval: 2, until: null })).toBe(true);
  });

  it('từ chối luật sai', () => {
    expect(isValidRule(null)).toBe(false);
    expect(isValidRule({ freq: 'YEARLY', interval: 1 })).toBe(false);
    expect(isValidRule({ freq: 'DAILY', interval: 0 })).toBe(false);
    expect(isValidRule({ freq: 'DAILY', interval: 53 })).toBe(false);
    expect(isValidRule({ freq: 'DAILY', interval: 1.5 })).toBe(false);
    expect(isValidRule({ freq: 'DAILY', interval: 1, until: 'không phải ngày' })).toBe(false);
  });
});

describe('describeRule', () => {
  it('mô tả bằng tiếng Việt', () => {
    expect(describeRule({ freq: 'WEEKLY', interval: 1 })).toBe('Hằng tuần');
    expect(describeRule({ freq: 'DAILY', interval: 3 })).toBe('Mỗi 3 ngày');
  });
});
