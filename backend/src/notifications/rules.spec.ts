import { classifyDue, describeDistance, formatVn, isInQuietHours, localMinuteOfDay } from './rules';

const H = 3600 * 1000;
const D = 24 * H;
// 10:00 giờ Việt Nam = 03:00 UTC
const NOW = new Date('2026-10-26T03:00:00.000Z');

describe('localMinuteOfDay', () => {
  it('tính theo giờ Việt Nam (UTC+7)', () => {
    expect(localMinuteOfDay(NOW)).toBe(10 * 60);
    expect(localMinuteOfDay(new Date('2026-10-26T17:00:00.000Z'))).toBe(0); // 00:00 VN
    expect(localMinuteOfDay(new Date('2026-10-26T16:59:00.000Z'))).toBe(23 * 60 + 59);
  });
});

describe('isInQuietHours (giờ yên lặng)', () => {
  const at = (hhmm: string) => new Date(`2026-10-26T${hhmm}:00.000Z`);

  it('tắt công tắc thì không bao giờ yên lặng', () => {
    expect(isInQuietHours(NOW, false, 0, 1439)).toBe(false);
  });

  it('khoảng trong ngày: 13:00–15:00 VN', () => {
    expect(isInQuietHours(at('07:00'), true, 13 * 60, 15 * 60)).toBe(true); // 14:00 VN
    expect(isInQuietHours(at('09:00'), true, 13 * 60, 15 * 60)).toBe(false); // 16:00 VN
  });

  it('khoảng vắt qua nửa đêm: 23:00–07:00 VN', () => {
    expect(isInQuietHours(at('16:30'), true, 23 * 60, 7 * 60)).toBe(true); // 23:30 VN
    expect(isInQuietHours(at('18:00'), true, 23 * 60, 7 * 60)).toBe(true); // 01:00 VN
    expect(isInQuietHours(at('23:30'), true, 23 * 60, 7 * 60)).toBe(true); // 06:30 VN, trước 07:00
    expect(isInQuietHours(at('03:00'), true, 23 * 60, 7 * 60)).toBe(false); // 10:00 VN, ban ngày
  });

  it('đúng biên: bắt đầu tính, kết thúc không tính; bắt đầu = kết thúc thì không có khoảng yên lặng', () => {
    expect(isInQuietHours(at('16:00'), true, 23 * 60, 7 * 60)).toBe(true); // đúng 23:00
    expect(isInQuietHours(at('00:00'), true, 23 * 60, 7 * 60)).toBe(false); // đúng 07:00 VN: đã hết yên lặng
    expect(isInQuietHours(NOW, true, 600, 600)).toBe(false);
  });
});

describe('classifyDue', () => {
  it('sắp đến hạn khi nằm trong khoảng nhắc trước; ngoài khoảng thì chưa nhắc', () => {
    expect(classifyDue(new Date(NOW.getTime() + 2 * H), NOW, 24 * 60)).toBe('SOON');
    expect(classifyDue(new Date(NOW.getTime() + 25 * H), NOW, 24 * 60)).toBeNull();
    expect(classifyDue(new Date(NOW.getTime() + 2 * H), NOW, 60)).toBeNull();
  });

  it('quá hạn trong 7 ngày thì nhắc; quá lâu thì bỏ qua', () => {
    expect(classifyDue(new Date(NOW.getTime() - 1 * H), NOW, 24 * 60)).toBe('OVERDUE');
    expect(classifyDue(new Date(NOW.getTime() - 6 * D), NOW, 24 * 60)).toBe('OVERDUE');
    expect(classifyDue(new Date(NOW.getTime() - 8 * D), NOW, 24 * 60)).toBeNull();
  });
});

describe('định dạng thời gian', () => {
  it('formatVn hiển thị giờ Việt Nam', () => {
    expect(formatVn(new Date('2026-10-26T16:30:00.000Z'))).toBe('23:30 26/10');
    expect(formatVn(new Date('2026-10-26T17:30:00.000Z'))).toBe('00:30 27/10');
  });

  it('describeDistance chọn đơn vị phù hợp', () => {
    expect(describeDistance(new Date(NOW.getTime() + 25 * 60000), NOW)).toBe('còn 25 phút');
    expect(describeDistance(new Date(NOW.getTime() + 3 * H), NOW)).toBe('còn 3 giờ');
    expect(describeDistance(new Date(NOW.getTime() + 2 * D), NOW)).toBe('còn 2 ngày');
    expect(describeDistance(new Date(NOW.getTime() - 2 * D), NOW)).toBe('đã trễ 2 ngày');
  });
});
