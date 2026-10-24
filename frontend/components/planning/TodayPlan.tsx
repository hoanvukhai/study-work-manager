'use client';

import React from 'react';
import { Lock, Target, AlertTriangle } from 'lucide-react';
import { usePlanOverview } from '@/hooks/usePlanning';
import { Skeleton } from '@/components/ui/Skeleton';
import { isoToLocalInput } from '@/lib/datetime';
import styles from './TodayPlan.module.css';

interface Props {
  onSelect: (objectId: string) => void;
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min} phút`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

function formatDue(iso: string | null): string {
  if (!iso) return 'Không có hạn';
  const local = isoToLocalInput(iso); // YYYY-MM-DDTHH:mm theo giờ địa phương
  const [date, time] = local.split('T');
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y} ${time}`;
}

export default function TodayPlan({ onSelect }: Props) {
  const { data, isLoading, isError } = usePlanOverview();

  return (
    <section className={styles.card} aria-label="Gợi ý hôm nay làm gì">
      <div className={styles.header}>
        <div className={styles.title}>
          <Target size={18} color="var(--primary-blue)" />
          Hôm nay làm gì?
        </div>
        <span className={styles.hint}>Xếp theo hạn chót, ưu tiên và việc bị chặn</span>
      </div>

      {isLoading && <Skeleton height={120} />}

      {isError && <div className={styles.empty}>Không tải được gợi ý. Thử tải lại trang.</div>}

      {data && data.suggestions.length === 0 && (
        <div className={styles.empty}>Không còn việc nào cần làm. Bạn có thể nghỉ ngơi 🎉</div>
      )}

      {data && data.suggestions.length > 0 && (
        <ol className={styles.list}>
          {data.suggestions.map((s, i) => (
            <li key={s.id}>
              <button type="button" className={styles.item} onClick={() => onSelect(s.id)}>
                <span className={styles.rank}>{i + 1}</span>
                <span className={styles.itemBody}>
                  <div className={styles.itemTitle}>{s.title}</div>
                  {s.reasons.length > 0 && (
                    <div className={styles.reasons}>
                      {s.reasons.map((r) => (
                        <span key={r} className={styles.reason}>
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </span>
                <span className={styles.meta}>
                  {formatDue(s.dueDate)}
                  {s.estimatedMinutes ? ` · ${formatMinutes(s.estimatedMinutes)}` : ''}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}

      {data && data.workload.overloaded && (
        <div className={`${styles.workload} ${styles.workloadWarn}`}>
          <AlertTriangle size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
          Quá tải: 7 ngày tới có {formatMinutes(data.workload.plannedMinutes)} việc đã ước lượng, trong khi
          chỉ còn khoảng {formatMinutes(data.workload.capacityMinutes)} có thể dành cho việc. Hãy dời bớt hoặc bỏ việc.
        </div>
      )}

      {data && !data.workload.overloaded && data.workload.unestimatedCount > 0 && (
        <div className={styles.workload}>
          {data.workload.unestimatedCount} việc có hạn trong 7 ngày tới chưa có thời gian ước lượng — thêm ước lượng
          để biết tuần này có quá tải không.
        </div>
      )}

      {data && data.blocked.length > 0 && (
        <div className={styles.blockedBox}>
          <div className={styles.blockedTitle}>
            <Lock size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
            Đang bị chặn ({data.blocked.length})
          </div>
          {data.blocked.map((b) => (
            <div key={b.id} className={styles.blockedItem}>
              {b.title} — chờ: {b.waitingFor.map((w) => w.title).join(', ')}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
