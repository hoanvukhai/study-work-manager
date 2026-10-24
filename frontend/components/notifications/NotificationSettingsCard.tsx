'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useNotificationSettings, useUpdateNotificationSettings } from '@/hooks/useNotifications';
import { useToast } from '@/components/ui/Toast';
import type { NotificationSettings } from '@/lib/notifications-api';
import profileStyles from '@/app/(dashboard)/profile/Profile.module.css';
import styles from './Notifications.module.css';

const REMIND_OPTIONS = [
  { value: 15, label: '15 phút' },
  { value: 60, label: '1 giờ' },
  { value: 180, label: '3 giờ' },
  { value: 1440, label: '1 ngày' },
  { value: 4320, label: '3 ngày' },
];

const TOGGLES: { key: keyof NotificationSettings; label: string }[] = [
  { key: 'enableDeadline', label: 'Việc sắp đến hạn' },
  { key: 'enableOverdue', label: 'Việc đã quá hạn' },
  { key: 'enableEvent', label: 'Sự kiện sắp diễn ra' },
  { key: 'enableDigest', label: 'Bản tin buổi sáng (07:00)' },
  { key: 'enableStudy', label: 'Đến lúc ôn tập' },
  { key: 'enableUnblocked', label: 'Việc được mở khoá' },
];

const toTime = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
const fromTime = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
};

export default function NotificationSettingsCard() {
  const { data: s } = useNotificationSettings();
  const update = useUpdateNotificationSettings();
  const toast = useToast();

  const save = (patch: Partial<NotificationSettings>) =>
    update.mutate(patch, { onError: (e) => toast.error(e instanceof Error ? e.message : 'Không lưu được cài đặt') });

  return (
    <div className={profileStyles.card}>
      <div className={profileStyles.cardHeader}>
        <Bell size={18} style={{ color: 'var(--primary-blue)' }} />
        <h2 className={profileStyles.cardTitle}>Thông báo</h2>
      </div>

      {!s ? (
        <div className={styles.rowHint}>Đang tải...</div>
      ) : (
        <div className={styles.settingsGrid}>
          <div className={styles.row}>
            <div>
              <div className={styles.rowLabel}>Nhắc trước khi đến hạn</div>
              <div className={styles.rowHint}>Áp dụng cho việc có hạn chót và sự kiện</div>
            </div>
            <select
              className={styles.select}
              value={s.remindBeforeMinutes}
              onChange={(e) => save({ remindBeforeMinutes: Number(e.target.value) })}
            >
              {REMIND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
              {!REMIND_OPTIONS.some((o) => o.value === s.remindBeforeMinutes) && (
                <option value={s.remindBeforeMinutes}>{s.remindBeforeMinutes} phút</option>
              )}
            </select>
          </div>

          <div className={styles.checks}>
            {TOGGLES.map((t) => (
              <label key={t.key} className={styles.check}>
                <input type="checkbox" checked={Boolean(s[t.key])} onChange={(e) => save({ [t.key]: e.target.checked })} />
                {t.label}
              </label>
            ))}
          </div>

          <div className={styles.row}>
            <label className={styles.check}>
              <input type="checkbox" checked={s.quietHoursEnabled} onChange={(e) => save({ quietHoursEnabled: e.target.checked })} />
              Giờ yên lặng (không tạo thông báo mới)
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="time"
                className={styles.time}
                disabled={!s.quietHoursEnabled}
                value={toTime(s.quietStartMinute)}
                onChange={(e) => e.target.value && save({ quietStartMinute: fromTime(e.target.value) })}
              />
              <span className={styles.rowHint}>đến</span>
              <input
                type="time"
                className={styles.time}
                disabled={!s.quietHoursEnabled}
                value={toTime(s.quietEndMinute)}
                onChange={(e) => e.target.value && save({ quietEndMinute: fromTime(e.target.value) })}
              />
            </div>
          </div>
          <div className={styles.rowHint}>Giờ theo múi giờ Việt Nam. Thông báo bị bỏ lỡ trong giờ yên lặng sẽ được tạo ngay khi hết giờ yên lặng nếu vẫn còn phù hợp.</div>
        </div>
      )}
    </div>
  );
}
