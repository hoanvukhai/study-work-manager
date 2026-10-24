'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpenCheck, Flame } from 'lucide-react';
import { useStudyStats } from '@/hooks/useStudy';
import { Button } from '@/components/ui/Button';
import styles from './Study.module.css';

export default function StudyDashCard() {
  const { data } = useStudyStats();
  if (!data) return null;
  // Chưa từng tạo thẻ và chưa học → không chiếm chỗ trên Dashboard
  if (data.totalCards === 0 && data.minutesWeek === 0) return null;

  return (
    <div className={styles.dashCard}>
      <div className={styles.dashText}>
        <BookOpenCheck size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} color="var(--primary-blue)" />
        {data.dueNow > 0 ? (
          <>
            Có <strong>{data.dueNow} thẻ</strong> đến lúc ôn
          </>
        ) : (
          <>Hôm nay không còn thẻ cần ôn</>
        )}
        {data.streakDays > 0 && (
          <>
            {' · '}
            <Flame size={14} style={{ verticalAlign: '-2px' }} color="#f59e0b" /> chuỗi {data.streakDays} ngày
          </>
        )}
      </div>
      <Link href="/study">
        <Button variant={data.dueNow > 0 ? 'primary' : 'outline'} size="sm">
          {data.dueNow > 0 ? 'Ôn ngay' : 'Mở trang Học tập'}
        </Button>
      </Link>
    </div>
  );
}
