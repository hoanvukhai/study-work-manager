// Đồ thị quan hệ giữa các Object (thuần túy, không phụ thuộc CSDL → dễ test).
// Cạnh from → to. Với DEPENDS_ON: "from phụ thuộc to" (to phải xong trước).
// Với PARENT_OF: "from là việc cha của to".

export interface Edge {
  from: string;
  to: string;
}

/**
 * Thêm cạnh from → to có tạo ra vòng không?
 * Có vòng khi từ `to` đi theo các cạnh hiện có vẫn tới được `from`
 * (hoặc from === to). Duyệt DFS không đệ quy để tránh tràn stack.
 */
export function wouldCreateCycle(edges: Edge[], from: string, to: string): boolean {
  if (from === to) return true;

  const adj = new Map<string, string[]>();
  for (const e of edges) {
    const list = adj.get(e.from);
    if (list) list.push(e.to);
    else adj.set(e.from, [e.to]);
  }

  const visited = new Set<string>();
  const stack = [to];
  while (stack.length > 0) {
    const node = stack.pop() as string;
    if (node === from) return true;
    if (visited.has(node)) continue;
    visited.add(node);
    for (const next of adj.get(node) ?? []) stack.push(next);
  }
  return false;
}
