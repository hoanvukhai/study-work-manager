// Bố cục đồ thị kiểu lực đẩy–kéo (Fruchterman–Reingold), tự viết, không phụ thuộc thư viện.
// Hai nút đẩy nhau, nút có liên kết kéo nhau lại; nhiệt độ giảm dần để bố cục ổn định.
// Kết quả xác định (không dùng số ngẫu nhiên) nên cùng dữ liệu luôn ra cùng bố cục.

export interface Point {
  x: number;
  y: number;
}

export interface LayoutOptions {
  width?: number;
  height?: number;
  iterations?: number;
}

export function forceLayout(
  ids: string[],
  edges: { from: string; to: string }[],
  opts: LayoutOptions = {},
): Map<string, Point> {
  const width = opts.width ?? 1000;
  const height = opts.height ?? 700;
  const iterations = opts.iterations ?? (ids.length > 250 ? 150 : 260);
  const n = ids.length;
  const out = new Map<string, Point>();
  if (n === 0) return out;
  if (n === 1) {
    out.set(ids[0], { x: width / 2, y: height / 2 });
    return out;
  }

  const index = new Map(ids.map((id, i) => [id, i]));
  const px = new Float64Array(n);
  const py = new Float64Array(n);
  // Khởi tạo trên vòng tròn, lệch nhẹ theo chỉ số để tránh trùng điểm
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n;
    const r = Math.min(width, height) * 0.35 * (0.6 + 0.4 * ((i * 7) % 10) / 10);
    px[i] = width / 2 + r * Math.cos(angle);
    py[i] = height / 2 + r * Math.sin(angle);
  }

  const links: [number, number][] = [];
  for (const e of edges) {
    const a = index.get(e.from);
    const b = index.get(e.to);
    if (a !== undefined && b !== undefined && a !== b) links.push([a, b]);
  }

  const area = width * height;
  const k = Math.sqrt(area / n) * 0.8;
  let temp = width / 8;
  const cool = temp / (iterations + 1);
  const dx = new Float64Array(n);
  const dy = new Float64Array(n);

  for (let it = 0; it < iterations; it++) {
    dx.fill(0);
    dy.fill(0);

    // Lực đẩy giữa mọi cặp nút
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let vx = px[i] - px[j];
        let vy = py[i] - py[j];
        let d2 = vx * vx + vy * vy;
        if (d2 < 0.01) {
          vx = (i - j) * 0.1;
          vy = 0.1;
          d2 = vx * vx + vy * vy;
        }
        const d = Math.sqrt(d2);
        const f = (k * k) / d; // lực đẩy
        const fx = (vx / d) * f;
        const fy = (vy / d) * f;
        dx[i] += fx;
        dy[i] += fy;
        dx[j] -= fx;
        dy[j] -= fy;
      }
    }

    // Lực kéo dọc theo liên kết
    for (const [a, b] of links) {
      const vx = px[a] - px[b];
      const vy = py[a] - py[b];
      const d = Math.sqrt(vx * vx + vy * vy) || 0.01;
      const f = (d * d) / k;
      const fx = (vx / d) * f;
      const fy = (vy / d) * f;
      dx[a] -= fx;
      dy[a] -= fy;
      dx[b] += fx;
      dy[b] += fy;
    }

    // Trọng lực nhẹ về tâm để các cụm rời nhau không trôi xa
    for (let i = 0; i < n; i++) {
      dx[i] += (width / 2 - px[i]) * 0.02;
      dy[i] += (height / 2 - py[i]) * 0.02;
    }

    // Di chuyển, giới hạn bởi nhiệt độ
    for (let i = 0; i < n; i++) {
      const d = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i]) || 0.01;
      const step = Math.min(d, temp);
      px[i] += (dx[i] / d) * step;
      py[i] += (dy[i] / d) * step;
    }
    temp -= cool;
  }

  for (let i = 0; i < n; i++) out.set(ids[i], { x: px[i], y: py[i] });
  return out;
}

/** Các nút trong phạm vi `depth` bước quanh `focusId` (coi liên kết là vô hướng). */
export function neighborhood(
  focusId: string,
  edges: { from: string; to: string }[],
  depth: number,
): Set<string> {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    (adj.get(e.from) ?? adj.set(e.from, []).get(e.from)!).push(e.to);
    (adj.get(e.to) ?? adj.set(e.to, []).get(e.to)!).push(e.from);
  }
  const seen = new Set([focusId]);
  let frontier = [focusId];
  for (let d = 0; d < depth; d++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const nb of adj.get(id) ?? []) {
        if (!seen.has(nb)) {
          seen.add(nb);
          next.push(nb);
        }
      }
    }
    frontier = next;
  }
  return seen;
}
