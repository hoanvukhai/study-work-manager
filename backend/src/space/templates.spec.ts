import { SPACE_TEMPLATES, findTemplate } from './templates';
import { wouldCreateCycle } from '../planning/graph';

describe('Mẫu Không gian (dữ liệu dựng sẵn)', () => {
  it.each(SPACE_TEMPLATES.map((t) => [t.id, t] as const))('mẫu "%s": khoá mục không trùng, tiêu đề không rỗng, màu hợp lệ', (_id, t) => {
    const keys = t.items.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const item of t.items) {
      expect(item.title.trim().length).toBeGreaterThan(0);
      expect(item.title.length).toBeLessThanOrEqual(255);
    }
    expect(t.name.length).toBeLessThanOrEqual(100);
    expect(t.color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it.each(SPACE_TEMPLATES.map((t) => [t.id, t] as const))('mẫu "%s": phụ thuộc chỉ giữa các Task có thật và không tạo vòng', (_id, t) => {
    const tasks = new Set(t.items.filter((i) => i.type === 'TASK').map((i) => i.key));
    const edges: { from: string; to: string }[] = [];
    for (const [a, b] of t.dependencies) {
      expect(tasks.has(a)).toBe(true);
      expect(tasks.has(b)).toBe(true);
      expect(wouldCreateCycle(edges, a, b)).toBe(false);
      edges.push({ from: a, to: b });
    }
  });

  it('id mẫu duy nhất và tra cứu được', () => {
    const ids = SPACE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(findTemplate('project')?.name).toBe('Đồ án / Dự án');
    expect(findTemplate('khong-co')).toBeUndefined();
  });
});
