'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Network } from 'lucide-react';
import { useKnowledgeGraph } from '@/hooks/useKnowledge';
import { useSpaces } from '@/hooks/useSpaces';
import GraphView, { TYPE_COLOR } from '@/components/knowledge/GraphView';
import ObjectDetailDrawer from '@/components/objects/ObjectDetailDrawer';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { neighborhood } from '@/lib/graph-layout';
import styles from '@/components/knowledge/Knowledge.module.css';

const TYPES = [
  { value: 'TASK', label: 'Công việc' },
  { value: 'NOTE', label: 'Ghi chú' },
  { value: 'EVENT', label: 'Sự kiện' },
  { value: 'REFERENCE', label: 'Tài liệu' },
] as const;

function GraphPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const focusId = params.get('focus');

  const [spaceId, setSpaceId] = useState('');
  const [types, setTypes] = useState<Set<string>>(new Set(TYPES.map((t) => t.value)));
  const [hideIsolated, setHideIsolated] = useState(true);
  const [depth, setDepth] = useState(2);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: spaces = [] } = useSpaces();
  const { data, isLoading, isError } = useKnowledgeGraph(spaceId || undefined);

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };
    let nodeList = data.nodes.filter((n) => types.has(n.type));
    let ids = new Set(nodeList.map((n) => n.id));
    let edgeList = data.edges.filter((e) => ids.has(e.from) && ids.has(e.to));

    if (focusId && ids.has(focusId)) {
      const near = neighborhood(focusId, edgeList, depth);
      nodeList = nodeList.filter((n) => near.has(n.id));
      ids = new Set(nodeList.map((n) => n.id));
      edgeList = edgeList.filter((e) => ids.has(e.from) && ids.has(e.to));
    } else if (hideIsolated) {
      const linked = new Set<string>();
      edgeList.forEach((e) => {
        linked.add(e.from);
        linked.add(e.to);
      });
      nodeList = nodeList.filter((n) => linked.has(n.id));
    }
    return { nodes: nodeList, edges: edgeList };
  }, [data, types, hideIsolated, focusId, depth]);

  const highlightIds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return undefined;
    return new Set(nodes.filter((n) => n.title.toLowerCase().includes(q)).map((n) => n.id));
  }, [search, nodes]);

  const toggleType = (t: string) =>
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>
          <Network size={22} style={{ verticalAlign: '-3px', marginRight: 8 }} color="var(--primary-blue)" />
          Bản đồ tri thức
        </h1>
        <p className={styles.sub}>Mỗi chấm là một mục, mỗi đường là một liên kết. Bấm vào chấm để xem chi tiết; kéo để di chuyển; cuộn để phóng to.</p>
      </div>

      {focusId && (
        <div className={styles.focusBar}>
          <span>Đang xem các mục quanh một mục ({depth} bước)</span>
          <select className={styles.select} value={depth} onChange={(e) => setDepth(Number(e.target.value))}>
            <option value={1}>1 bước</option>
            <option value={2}>2 bước</option>
            <option value={3}>3 bước</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => router.push('/graph')}>
            Xem toàn bộ bản đồ
          </Button>
        </div>
      )}

      <div className={styles.toolbar}>
        <select className={styles.select} value={spaceId} onChange={(e) => setSpaceId(e.target.value)} aria-label="Lọc theo Không gian">
          <option value="">Tất cả Không gian</option>
          {spaces.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon} {s.name}
            </option>
          ))}
        </select>
        {TYPES.map((t) => (
          <label key={t.value} className={styles.check}>
            <input type="checkbox" checked={types.has(t.value)} onChange={() => toggleType(t.value)} />
            <span className={styles.dot} style={{ background: TYPE_COLOR[t.value] }} />
            {t.label}
          </label>
        ))}
        {!focusId && (
          <label className={styles.check}>
            <input type="checkbox" checked={hideIsolated} onChange={(e) => setHideIsolated(e.target.checked)} />
            Ẩn mục chưa có liên kết
          </label>
        )}
        <input
          className={styles.search}
          type="search"
          placeholder="Tìm trên bản đồ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.canvas}>
        {isLoading && <Skeleton height="100%" />}
        {isError && <div className={styles.empty}>Không tải được bản đồ. Thử tải lại trang.</div>}
        {data && nodes.length === 0 && (
          <div className={styles.empty}>
            Chưa có mục nào được liên kết.
            <br />
            Hãy gõ <b>[[Tiêu đề]]</b> trong nội dung một mục, hoặc dùng “Thêm liên kết” trong khung chi tiết.
          </div>
        )}
        {data && nodes.length > 0 && (
          <GraphView nodes={nodes} edges={edges} selectedId={selectedId} highlightIds={highlightIds} onSelect={setSelectedId} />
        )}
      </div>

      <div className={styles.legend}>
        <span>— Liên quan / tham chiếu</span>
        <span>··· Tự sinh từ [[ ]]</span>
        <span>- - → Phụ thuộc (chỉ về việc phải làm trước)</span>
        <span>━→ Việc cha → việc con</span>
      </div>
      {data?.truncated && <div className={styles.warn}>Chỉ hiển thị 400 mục mới cập nhật nhất. Hãy lọc theo Không gian để xem đầy đủ.</div>}

      {selectedId && (
        <ObjectDetailDrawer
          objectId={selectedId}
          onClose={() => setSelectedId(null)}
          onSelectObject={(id) => setSelectedId(id)}
        />
      )}
    </div>
  );
}

export default function GraphPage() {
  return (
    <Suspense fallback={<Skeleton height={400} />}>
      <GraphPageInner />
    </Suspense>
  );
}
