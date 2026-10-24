'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { forceLayout, Point } from '@/lib/graph-layout';
import type { GraphEdge, GraphNode } from '@/lib/knowledge-api';
import styles from './Knowledge.module.css';

export const TYPE_COLOR: Record<string, string> = {
  TASK: '#1a73e8',
  NOTE: '#e37400',
  EVENT: '#188038',
  REFERENCE: '#9334e6',
};

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId?: string | null;
  highlightIds?: Set<string>;
  onSelect: (id: string) => void;
}

const W = 1000;
const H = 700;

/** Phóng/dịch để toàn bộ nút nằm vừa khung nhìn (chừa lề cho nhãn). */
function fitView(points: Map<string, Point>): { x: number; y: number; k: number } {
  if (points.size === 0) return { x: 0, y: 0, k: 1 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  points.forEach((p) => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });
  const pad = 70;
  const w = Math.max(maxX - minX, 1);
  const h = Math.max(maxY - minY, 1);
  const k = Math.min(1.6, (W - pad * 2) / w, (H - pad * 2) / h);
  return { k, x: W / 2 - ((minX + maxX) / 2) * k, y: H / 2 - ((minY + maxY) / 2) * k };
}

function trim(text: string, max = 22): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export default function GraphView({ nodes, edges, selectedId, highlightIds, onSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Map<string, Point>>(new Map());

  // Chỉ tính lại bố cục khi tập nút/cạnh thật sự đổi
  const signature = useMemo(
    () => nodes.map((n) => n.id).join('|') + '#' + edges.map((e) => `${e.from}>${e.to}`).join('|'),
    [nodes, edges],
  );
  useEffect(() => {
    const layout = forceLayout(nodes.map((n) => n.id), edges, { width: W, height: H });
    setPositions(layout);
    setView(fitView(layout));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const degree = useMemo(() => {
    const d = new Map<string, number>();
    for (const e of edges) {
      d.set(e.from, (d.get(e.from) ?? 0) + 1);
      d.set(e.to, (d.get(e.to) ?? 0) + 1);
    }
    return d;
  }, [edges]);

  // Chuyển toạ độ màn hình → toạ độ bản đồ
  const toWorld = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * W;
    const sy = ((clientY - rect.top) / rect.height) * H;
    return { x: (sx - view.x) / view.k, y: (sy - view.y) / view.k };
  };

  // Cuộn chuột để phóng to/thu nhỏ quanh con trỏ (cần listener không-passive để chặn cuộn trang)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) / rect.width) * W;
      const sy = ((e.clientY - rect.top) / rect.height) * H;
      setView((v) => {
        const k = Math.min(4, Math.max(0.3, v.k * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
        const wx = (sx - v.x) / v.k;
        const wy = (sy - v.y) / v.k;
        return { k, x: sx - wx * k, y: sy - wy * k };
      });
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  // Kéo nền để dịch chuyển; kéo nút để di chuyển nút
  const drag = useRef<{ kind: 'pan' | 'node'; id?: string; sx: number; sy: number; moved: boolean; vx: number; vy: number } | null>(null);

  const onBackgroundDown = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    drag.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, moved: false, vx: view.x, vy: view.y };
  };
  const onNodeDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    drag.current = { kind: 'node', id, sx: e.clientX, sy: e.clientY, moved: false, vx: 0, vy: 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dxs = e.clientX - d.sx;
    const dys = e.clientY - d.sy;
    if (Math.abs(dxs) + Math.abs(dys) > 3) d.moved = true;
    if (!d.moved) return;
    if (d.kind === 'pan') {
      const rect = svgRef.current!.getBoundingClientRect();
      setView((v) => ({ ...v, x: d.vx + (dxs / rect.width) * W, y: d.vy + (dys / rect.height) * H }));
    } else if (d.id) {
      const p = toWorld(e.clientX, e.clientY);
      setPositions((prev) => new Map(prev).set(d.id!, p));
    }
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && d.kind === 'node' && !d.moved && d.id) onSelect(d.id);
  };

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const hasHighlight = !!highlightIds && highlightIds.size > 0;
  const showAllLabels = view.k >= 0.9 || nodes.length <= 40;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <button type="button" className={styles.fitBtn} onClick={() => setView(fitView(positions))}>
      Căn lại
    </button>
    <svg
      ref={svgRef}
      className={styles.svg}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Bản đồ tri thức"
      onPointerMove={onMove}
      onPointerUp={onUp}
    >
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-secondary)" />
        </marker>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="transparent" onPointerDown={onBackgroundDown} style={{ cursor: 'grab' }} />
      <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
        {edges.map((e) => {
          const a = positions.get(e.from);
          const b = positions.get(e.to);
          if (!a || !b) return null;
          const dim = hasHighlight && !(highlightIds!.has(e.from) && highlightIds!.has(e.to));
          const dependency = e.relationType === 'DEPENDS_ON';
          return (
            <line
              key={e.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--text-secondary)"
              strokeWidth={e.relationType === 'PARENT_OF' ? 2.4 : 1.2}
              strokeDasharray={dependency ? '6 4' : e.auto ? '2 3' : undefined}
              markerEnd={dependency || e.relationType === 'PARENT_OF' ? 'url(#arrow)' : undefined}
              opacity={dim ? 0.08 : 0.55}
            />
          );
        })}
        {nodes.map((n) => {
          const p = positions.get(n.id);
          if (!p) return null;
          const deg = degree.get(n.id) ?? 0;
          const r = 7 + Math.min(8, deg * 1.5);
          const selected = n.id === selectedId;
          const dim = hasHighlight && !highlightIds!.has(n.id);
          const showLabel = showAllLabels || selected || hoverId === n.id || (hasHighlight && highlightIds!.has(n.id));
          return (
            <g
              key={n.id}
              transform={`translate(${p.x} ${p.y})`}
              opacity={dim ? 0.15 : 1}
              style={{ cursor: 'pointer' }}
              onPointerDown={(ev) => onNodeDown(ev, n.id)}
              onPointerEnter={() => setHoverId(n.id)}
              onPointerLeave={() => setHoverId((h) => (h === n.id ? null : h))}
            >
              <title>{n.title}</title>
              <circle
                r={r}
                fill={TYPE_COLOR[n.type] ?? '#888'}
                stroke={selected ? 'var(--text-primary)' : 'var(--surface)'}
                strokeWidth={selected ? 3 : 2}
                opacity={n.status === 'DONE' || n.status === 'CANCELLED' ? 0.45 : 1}
              />
              {showLabel && (
                <text y={r + 13} textAnchor="middle" className={styles.nodeLabel}>
                  {trim(nodeById.get(n.id)!.title)}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
    </div>
  );
}
