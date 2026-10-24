'use client';

import React from 'react';
import { Flame } from 'lucide-react';
import { useStudyStats } from '@/hooks/useStudy';
import ReviewSession from '@/components/study/ReviewSession';
import Pomodoro from '@/components/study/Pomodoro';
import styles from '@/components/study/Study.module.css';

const WEEKDAY = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function weekdayOf(dateKey: string): string {
  // dateKey là YYYY-MM-DD theo giờ Việt Nam; dựng ở giữa ngày UTC để không lệch thứ
  return WEEKDAY[new Date(`${dateKey}T12:00:00.000Z`).getUTCDay()];
}

export default function StudyPage() {
  const { data: stats } = useStudyStats();
  const maxActivity = Math.max(1, ...(stats?.last7Days ?? []).map((d) => d.reviews + d.minutes));

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.pageTitle}>Học tập</h1>
        <p className={styles.pageSub}>Ôn đúng lúc sắp quên và ghi lại thời gian học thật.</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats?.dueNow ?? '–'}</div>
          <div className={styles.statLabel}>Thẻ cần ôn hôm nay</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats?.reviewedToday ?? '–'}</div>
          <div className={styles.statLabel}>Đã ôn hôm nay</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {stats ? stats.streakDays : '–'} <Flame size={18} color="#f59e0b" style={{ verticalAlign: '-2px' }} />
          </div>
          <div className={styles.statLabel}>Chuỗi ngày học liên tiếp</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats ? stats.minutesWeek : '–'}</div>
          <div className={styles.statLabel}>Phút tập trung 7 ngày qua</div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <ReviewSession />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Pomodoro />
          <section className={styles.panel} aria-label="Hoạt động 7 ngày">
            <div className={styles.panelTitle}>7 ngày gần nhất</div>
            <div className={styles.bars}>
              {(stats?.last7Days ?? []).map((d) => {
                const value = d.reviews + d.minutes;
                return (
                  <div
                    key={d.date}
                    className={styles.barCol}
                    title={`${d.date}: ${d.reviews} lượt ôn, ${d.minutes} phút tập trung`}
                  >
                    <div
                      className={`${styles.bar} ${value === 0 ? styles.barEmpty : ''}`}
                      style={{ height: `${Math.max(3, (value / maxActivity) * 100)}%` }}
                    />
                    <span>{weekdayOf(d.date)}</span>
                  </div>
                );
              })}
            </div>
            <div className={styles.hint}>Cột = số lượt ôn + số phút tập trung trong ngày</div>
          </section>
        </div>
      </div>
    </div>
  );
}
