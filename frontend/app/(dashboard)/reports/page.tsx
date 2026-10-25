'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { getWeeklyReport } from '@/lib/reports-api';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './Reports.module.css';

const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const weekdayOf = (key: string) => WEEKDAY[new Date(`${key}T12:00:00.000Z`).getUTCDay()];
const fmt = (key: string) => key.split('-').reverse().slice(0, 2).join('/');

function Delta({ value, unit = '' }: { value: number; unit?: string }) {
  if (value === 0) return <div className={`${styles.delta} ${styles.flat}`}>Bằng tuần trước</div>;
  const up = value > 0;
  return (
    <div className={`${styles.delta} ${up ? styles.up : styles.down}`}>
      {up ? '▲' : '▼'} {Math.abs(value)}
      {unit} so với tuần trước
    </div>
  );
}

function Bars({ title, values, dates, className }: { title: string; values: number[]; dates: string[]; className?: string }) {
  const max = Math.max(1, ...values);
  return (
    <div>
      <div className={styles.chartLabel}>{title}</div>
      <div className={styles.bars}>
        {values.map((v, i) => (
          <div key={dates[i]} className={styles.barCol} title={`${dates[i]}: ${v}`}>
            <span>{v || ''}</span>
            <div className={`${styles.bar} ${className ?? ''} ${v === 0 ? styles.barEmpty : ''}`} style={{ height: `${Math.max(3, (v / max) * 80)}%` }} />
            <span>{weekdayOf(dates[i])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading, isError } = useQuery({ queryKey: ['reports', 'weekly', offset], queryFn: () => getWeeklyReport(offset) });

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>
            <BarChart3 size={22} style={{ verticalAlign: '-3px', marginRight: 8 }} color="var(--primary-blue)" />
            Báo cáo tuần
          </h1>
          <div className={styles.range}>
            {data
              ? `${fmt(data.weekStart)} – ${fmt(data.weekEnd)}${data.isCurrentWeek ? ' (tuần này)' : offset === 1 ? ' (tuần trước)' : ''}`
              : 'Đang tải...'}
          </div>
        </div>
        <div className={styles.nav}>
          <Button variant="outline" size="sm" onClick={() => setOffset((o) => o + 1)} aria-label="Tuần trước">
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset((o) => Math.max(0, o - 1))} aria-label="Tuần sau">
            <ChevronRight size={16} />
          </Button>
          {offset !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setOffset(0)}>
              Về tuần này
            </Button>
          )}
        </div>
      </div>

      {isLoading && <Skeleton height={260} />}
      {isError && <div className={styles.empty}>Không tải được báo cáo.</div>}

      {data && (
        <>
          <div className={styles.cards}>
            <div className={styles.card}>
              <div className={styles.value}>{data.tasks.completed}</div>
              <div className={styles.label}>Việc đã hoàn thành</div>
              <Delta value={data.vsPreviousWeek.tasksCompleted} />
            </div>
            <div className={styles.card}>
              <div className={styles.value}>{data.tasks.onTimeRate === null ? '—' : `${data.tasks.onTimeRate}%`}</div>
              <div className={styles.label}>Xong đúng hạn</div>
              <div className={`${styles.delta} ${styles.flat}`}>
                {data.tasks.dueInWeek > 0 ? `${data.tasks.dueAndDone}/${data.tasks.dueInWeek} việc đến hạn đã xong` : 'Không có việc đến hạn'}
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.value}>{data.study.reviews}</div>
              <div className={styles.label}>Lượt ôn thẻ</div>
              <Delta value={data.vsPreviousWeek.reviews} />
            </div>
            <div className={styles.card}>
              <div className={styles.value}>{data.study.retentionRate === null ? '—' : `${data.study.retentionRate}%`}</div>
              <div className={styles.label}>Tỉ lệ nhớ khi ôn</div>
            </div>
            <div className={styles.card}>
              <div className={styles.value}>{data.study.minutes}</div>
              <div className={styles.label}>Phút tập trung</div>
              <Delta value={data.vsPreviousWeek.minutes} unit=" phút" />
            </div>
            <div className={styles.card}>
              <div className={styles.value}>{data.study.activeDays}/7</div>
              <div className={styles.label}>Ngày có học</div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>Theo từng ngày</div>
            <div className={styles.charts}>
              <Bars title="Việc hoàn thành" values={data.days.map((d) => d.tasksCompleted)} dates={data.days.map((d) => d.date)} className={styles.barGreen} />
              <Bars title="Lượt ôn thẻ" values={data.days.map((d) => d.reviews)} dates={data.days.map((d) => d.date)} />
              <Bars title="Phút tập trung" values={data.days.map((d) => d.minutes)} dates={data.days.map((d) => d.date)} className={styles.barAmber} />
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>Không gian làm được nhiều nhất</div>
            {data.topSpaces.length === 0 ? (
              <div className={styles.empty}>Chưa có việc hoàn thành thuộc Không gian nào trong tuần này.</div>
            ) : (
              <div className={styles.list}>
                {data.topSpaces.map((s) => (
                  <div key={s.id} className={styles.row}>
                    <span>
                      {s.icon} {s.name}
                    </span>
                    <span>{s.completed} việc</span>
                  </div>
                ))}
              </div>
            )}
            {data.tasks.dueNotDone > 0 && (
              <div className={styles.empty}>
                Còn {data.tasks.dueNotDone} việc có hạn trong tuần này chưa xong.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
