import { startOfLocalWeek } from '../common/timezone';

describe('startOfLocalWeek (tuần bắt đầu thứ Hai, giờ Việt Nam)', () => {
  const monday = '2026-10-25T17:00:00.000Z'; // 00:00 thứ Hai 26/10/2026 giờ VN

  it('giữa tuần → thứ Hai cùng tuần', () => {
    expect(startOfLocalWeek(new Date('2026-10-28T03:00:00.000Z')).toISOString()).toBe(monday); // thứ Tư 10:00 VN
  });

  it('Chủ nhật 23:59 vẫn thuộc tuần đó', () => {
    expect(startOfLocalWeek(new Date('2026-11-01T16:59:00.000Z')).toISOString()).toBe(monday); // CN 23:59 VN
  });

  it('đúng 00:00 thứ Hai là đầu tuần mới; trước đó 1 phút vẫn là tuần cũ', () => {
    expect(startOfLocalWeek(new Date('2026-11-01T17:00:00.000Z')).toISOString()).toBe('2026-11-01T17:00:00.000Z');
    expect(startOfLocalWeek(new Date('2026-11-01T16:59:00.000Z')).toISOString()).toBe(monday);
  });

  it('thứ Hai 00:30 giờ VN (vẫn là Chủ nhật theo UTC) thuộc tuần mới', () => {
    expect(startOfLocalWeek(new Date('2026-10-25T17:30:00.000Z')).toISOString()).toBe(monday);
  });
});
