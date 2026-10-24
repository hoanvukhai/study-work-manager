import { computeStreak, parseCards } from './cards';
import { previewMinutes, reviewCard, CardState, DEFAULT_EASE } from './sm2';
import { localDateKeyDaysAgo, startOfLocalDay, toLocalDateKey } from '../common/timezone';

const NOW = new Date('2026-10-26T03:00:00.000Z');
const DAY_MIN = 24 * 60;
const fresh: CardState = { easeFactor: DEFAULT_EASE, intervalDays: 0, repetitions: 0 };

describe('SM-2 (reviewCard)', () => {
  it('lần đầu nhớ: ôn lại sau 1 ngày; lần hai: 6 ngày; lần ba: nhân hệ số dễ', () => {
    const r1 = reviewCard(fresh, 'GOOD', NOW);
    expect(r1.intervalDays).toBe(1);
    expect(r1.repetitions).toBe(1);

    const r2 = reviewCard(r1, 'GOOD', NOW);
    expect(r2.intervalDays).toBe(6);

    const r3 = reviewCard(r2, 'GOOD', NOW);
    expect(r3.intervalDays).toBe(Math.round(6 * r3.easeFactor));
    expect(r3.repetitions).toBe(3);
  });

  it('chuỗi điểm mẫu kinh điển: Dễ-Dễ-Dễ cho khoảng cách 1 → 6 → 17 ngày, hệ số dễ tăng 0,1 mỗi lần', () => {
    const a = reviewCard(fresh, 'EASY', NOW);
    const b = reviewCard(a, 'EASY', NOW);
    const c = reviewCard(b, 'EASY', NOW);
    expect([a.intervalDays, b.intervalDays, c.intervalDays]).toEqual([1, 6, 17]); // lần 3: EF mới = 2,8 → 6 × 2,8 = 16,8 → 17
    expect(c.easeFactor).toBeCloseTo(2.8, 5);
  });

  it('Quên: về học lại từ đầu, hiện lại sau 10 phút, giữ nguyên hệ số dễ', () => {
    const learned = reviewCard(reviewCard(fresh, 'GOOD', NOW), 'GOOD', NOW);
    const forgot = reviewCard(learned, 'AGAIN', NOW);
    expect(forgot.repetitions).toBe(0);
    expect(forgot.intervalDays).toBe(1);
    expect(forgot.easeFactor).toBe(learned.easeFactor);
    expect(forgot.dueAt.getTime() - NOW.getTime()).toBe(10 * 60 * 1000);
  });

  it('Khó nhớ giảm hệ số dễ 0,14; hệ số không bao giờ thấp hơn 1,3', () => {
    expect(reviewCard(fresh, 'HARD', NOW).easeFactor).toBeCloseTo(2.36, 5);
    let s = fresh;
    for (let i = 0; i < 30; i++) s = reviewCard(s, 'HARD', NOW);
    expect(s.easeFactor).toBe(1.3);
  });

  it('Nhớ (q=4) giữ nguyên hệ số dễ', () => {
    expect(reviewCard(fresh, 'GOOD', NOW).easeFactor).toBe(DEFAULT_EASE);
  });

  it('thẻ nhớ tốt hơn thì lần ôn tiếp theo xa hơn', () => {
    const state: CardState = { easeFactor: 2.5, intervalDays: 6, repetitions: 2 };
    const p = previewMinutes(state, NOW);
    expect(p.AGAIN).toBe(10);
    expect(p.GOOD).toBeGreaterThan(p.AGAIN);
    expect(p.EASY).toBeGreaterThanOrEqual(p.GOOD);
    expect(p.GOOD).toBe(Math.round(6 * 2.5) * DAY_MIN);
  });
});

describe('parseCards (tách thẻ từ Note)', () => {
  it('lấy các dòng "Hỏi :: Đáp", chấp nhận gạch đầu dòng, bỏ dòng thường', () => {
    const text = ['Tiêu đề bài', 'JWT là gì? :: Chuỗi token ký số', '- Bcrypt dùng để? :: Băm mật khẩu', 'dòng thường'].join('\n');
    expect(parseCards(text)).toEqual([
      { front: 'JWT là gì?', back: 'Chuỗi token ký số' },
      { front: 'Bcrypt dùng để?', back: 'Băm mật khẩu' },
    ]);
  });

  it('bỏ dòng thiếu vế; trùng câu hỏi thì dòng sau thắng; xử lý xuống dòng kiểu Windows', () => {
    const text = 'A :: \r\n :: B\r\nQ :: cũ\r\nQ :: mới';
    expect(parseCards(text)).toEqual([{ front: 'Q', back: 'mới' }]);
  });

  it('đáp án được chứa dấu "::" thứ hai; rỗng/null trả mảng rỗng', () => {
    expect(parseCards('std :: namespace::cout')).toEqual([{ front: 'std', back: 'namespace::cout' }]);
    expect(parseCards(null)).toEqual([]);
    expect(parseCards('')).toEqual([]);
  });
});

describe('computeStreak (chuỗi ngày học)', () => {
  it('đếm các ngày liên tiếp đến hôm nay', () => {
    expect(computeStreak(new Set(['2026-10-24', '2026-10-25', '2026-10-26']), '2026-10-26')).toBe(3);
  });

  it('hôm nay chưa học thì chuỗi vẫn giữ tính từ hôm qua', () => {
    expect(computeStreak(new Set(['2026-10-24', '2026-10-25']), '2026-10-26')).toBe(2);
  });

  it('lỡ cả hôm qua thì chuỗi về 0; đứt giữa chừng thì chỉ đếm đoạn gần nhất', () => {
    expect(computeStreak(new Set(['2026-10-20']), '2026-10-26')).toBe(0);
    expect(computeStreak(new Set(['2026-10-20', '2026-10-21', '2026-10-25', '2026-10-26']), '2026-10-26')).toBe(2);
  });

  it('qua ranh giới tháng/năm', () => {
    expect(computeStreak(new Set(['2026-12-31', '2027-01-01']), '2027-01-01')).toBe(2);
  });
});

describe('timezone (giờ Việt Nam UTC+7)', () => {
  it('23:30 giờ VN và 00:30 giờ VN thuộc hai ngày khác nhau', () => {
    expect(toLocalDateKey(new Date('2026-10-25T16:30:00.000Z'))).toBe('2026-10-25'); // 23:30 VN
    expect(toLocalDateKey(new Date('2026-10-25T17:30:00.000Z'))).toBe('2026-10-26'); // 00:30 VN
  });

  it('startOfLocalDay là 00:00 giờ VN (17:00 UTC hôm trước)', () => {
    expect(startOfLocalDay(new Date('2026-10-26T03:00:00.000Z')).toISOString()).toBe('2026-10-25T17:00:00.000Z');
  });

  it('localDateKeyDaysAgo lùi đúng số ngày', () => {
    expect(localDateKeyDaysAgo(NOW, 0)).toBe('2026-10-26');
    expect(localDateKeyDaysAgo(NOW, 3)).toBe('2026-10-23');
  });
});
