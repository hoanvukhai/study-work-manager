import { wouldCreateCycle } from './graph';
import { buildOverview, scoreTask, PlanTask } from './scoring';

const NOW = new Date('2026-10-26T03:00:00.000Z');
const H = 3600 * 1000;

const task = (over: Partial<PlanTask> & { id: string }): PlanTask => ({
  title: over.id,
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: null,
  estimatedMinutes: null,
  blockedBy: [],
  unblocksCount: 0,
  ...over,
});

describe('wouldCreateCycle (phát hiện vòng phụ thuộc)', () => {
  const edges = [
    { from: 'A', to: 'B' }, // A phụ thuộc B
    { from: 'B', to: 'C' }, // B phụ thuộc C
  ];

  it('tự phụ thuộc chính mình là vòng', () => {
    expect(wouldCreateCycle([], 'A', 'A')).toBe(true);
  });

  it('đồ thị rỗng: thêm cạnh bất kỳ không tạo vòng', () => {
    expect(wouldCreateCycle([], 'A', 'B')).toBe(false);
  });

  it('C phụ thuộc A khép kín chuỗi A→B→C→A (vòng gián tiếp)', () => {
    expect(wouldCreateCycle(edges, 'C', 'A')).toBe(true);
  });

  it('B phụ thuộc A tạo vòng trực tiếp A⇄B', () => {
    expect(wouldCreateCycle(edges, 'B', 'A')).toBe(true);
  });

  it('cạnh đi cùng chiều hoặc sang nhánh khác không tạo vòng', () => {
    expect(wouldCreateCycle(edges, 'A', 'C')).toBe(false); // đường tắt, vẫn là DAG
    expect(wouldCreateCycle(edges, 'D', 'A')).toBe(false);
    expect(wouldCreateCycle(edges, 'C', 'D')).toBe(false);
  });

  it('không lặp vô hạn khi đồ thị có nhánh rẽ và hội tụ (kim cương)', () => {
    const diamond = [
      { from: 'A', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'B', to: 'D' },
      { from: 'C', to: 'D' },
    ];
    expect(wouldCreateCycle(diamond, 'D', 'A')).toBe(true);
    expect(wouldCreateCycle(diamond, 'B', 'C')).toBe(false);
  });
});

describe('scoreTask (chấm điểm gợi ý)', () => {
  it('quá hạn điểm cao hơn hạn trong 24h, cao hơn hạn trong tuần, cao hơn không có hạn', () => {
    const overdue = scoreTask(task({ id: 'a', dueDate: new Date(NOW.getTime() - 2 * 24 * H) }), NOW);
    const d1 = scoreTask(task({ id: 'b', dueDate: new Date(NOW.getTime() + 5 * H) }), NOW);
    const d3 = scoreTask(task({ id: 'c', dueDate: new Date(NOW.getTime() + 48 * H) }), NOW);
    const d7 = scoreTask(task({ id: 'd', dueDate: new Date(NOW.getTime() + 5 * 24 * H) }), NOW);
    const none = scoreTask(task({ id: 'e' }), NOW);
    expect(overdue.score).toBeGreaterThan(d1.score);
    expect(d1.score).toBeGreaterThan(d3.score);
    expect(d3.score).toBeGreaterThan(d7.score);
    expect(d7.score).toBeGreaterThan(none.score);
    expect(overdue.reasons).toContain('Đã quá hạn 2 ngày');
  });

  it('ưu tiên cao hơn thì điểm cao hơn khi cùng hạn', () => {
    const due = new Date(NOW.getTime() + 48 * H);
    const urgent = scoreTask(task({ id: 'u', priority: 'URGENT', dueDate: due }), NOW);
    const low = scoreTask(task({ id: 'l', priority: 'LOW', dueDate: due }), NOW);
    expect(urgent.score - low.score).toBe(30);
    expect(urgent.reasons).toContain('Mức ưu tiên khẩn cấp');
  });

  it('việc mở khoá nhiều việc khác được cộng điểm, tối đa 15', () => {
    const one = scoreTask(task({ id: 'x', unblocksCount: 1 }), NOW);
    const many = scoreTask(task({ id: 'y', unblocksCount: 10 }), NOW);
    const zero = scoreTask(task({ id: 'z' }), NOW);
    expect(one.score - zero.score).toBe(5);
    expect(many.score - zero.score).toBe(15);
    expect(many.reasons).toContain('Mở khoá 10 việc khác');
  });

  it('đang làm dở được cộng điểm', () => {
    const wip = scoreTask(task({ id: 'w', status: 'IN_PROGRESS' }), NOW);
    const todo = scoreTask(task({ id: 't' }), NOW);
    expect(wip.score - todo.score).toBe(10);
  });
});

describe('buildOverview (gợi ý "Hôm nay làm gì?")', () => {
  it('việc bị chặn không được gợi ý mà nằm trong danh sách blocked kèm tiền đề', () => {
    const tasks = [
      task({ id: 'auth', title: 'Module Auth', unblocksCount: 1 }),
      task({ id: 'space', title: 'Module Space', blockedBy: [{ id: 'auth', title: 'Module Auth' }] }),
    ];
    const res = buildOverview(tasks, NOW);
    expect(res.suggestions.map((s) => s.id)).toEqual(['auth']);
    expect(res.blocked).toEqual([
      { id: 'space', title: 'Module Space', waitingFor: [{ id: 'auth', title: 'Module Auth' }] },
    ]);
  });

  it('sắp theo điểm giảm dần, hoà điểm thì hạn gần hơn trước, tối đa 5 gợi ý', () => {
    const tasks = Array.from({ length: 8 }, (_, i) =>
      task({ id: `t${i}`, dueDate: new Date(NOW.getTime() + (i + 1) * 5 * H) }),
    );
    const res = buildOverview(tasks, NOW);
    expect(res.suggestions).toHaveLength(5);
    const scores = res.suggestions.map((s) => s.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    expect(res.suggestions[0].id).toBe('t0');
  });

  it('mức tải: cộng thời gian ước lượng của việc có hạn trong 7 ngày, báo quá tải khi vượt 28 giờ', () => {
    const inWeek = new Date(NOW.getTime() + 2 * 24 * H);
    const ok = buildOverview(
      [task({ id: 'a', dueDate: inWeek, estimatedMinutes: 600 }), task({ id: 'b', dueDate: inWeek })],
      NOW,
    );
    expect(ok.workload).toEqual({
      plannedMinutes: 600,
      capacityMinutes: 1680,
      unestimatedCount: 1,
      overloaded: false,
    });

    const over = buildOverview(
      [task({ id: 'a', dueDate: inWeek, estimatedMinutes: 1000 }), task({ id: 'b', dueDate: inWeek, estimatedMinutes: 800 })],
      NOW,
    );
    expect(over.workload.overloaded).toBe(true);
  });

  it('việc có hạn sau 7 ngày không tính vào mức tải tuần này', () => {
    const far = new Date(NOW.getTime() + 20 * 24 * H);
    const res = buildOverview([task({ id: 'a', dueDate: far, estimatedMinutes: 5000 })], NOW);
    expect(res.workload.plannedMinutes).toBe(0);
    expect(res.workload.overloaded).toBe(false);
  });
});
