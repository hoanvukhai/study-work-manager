'use client';

import React, { useState } from 'react';
import { CalendarDays, Copy } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import profileStyles from '@/app/(dashboard)/profile/Profile.module.css';
import styles from './Notifications.module.css';

interface FeedToken {
  token: string;
  path: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function CalendarFeedCard() {
  const qc = useQueryClient();
  const toast = useToast();
  const [confirmRotate, setConfirmRotate] = useState(false);

  const { data } = useQuery({
    queryKey: ['calendar-feed-token'],
    queryFn: () => apiRequest<FeedToken>('/calendar/feed-token'),
  });
  const rotate = useMutation({
    mutationFn: () => apiRequest<FeedToken>('/calendar/feed-token/rotate', { method: 'POST' }),
    onSuccess: (d) => {
      qc.setQueryData(['calendar-feed-token'], d);
      toast.success('Đã tạo địa chỉ lịch mới. Địa chỉ cũ không còn dùng được.');
    },
  });

  const url = data ? `${API_BASE}${data.path}` : '';
  const isLocal = /localhost|127\.0\.0\.1/.test(API_BASE);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép địa chỉ lịch');
    } catch {
      toast.error('Không sao chép được — hãy chọn và copy thủ công');
    }
  };

  return (
    <div className={profileStyles.card}>
      <div className={profileStyles.cardHeader}>
        <CalendarDays size={18} style={{ color: 'var(--primary-blue)' }} />
        <h2 className={profileStyles.cardTitle}>Đồng bộ lịch (Google Calendar, điện thoại)</h2>
      </div>

      <div className={styles.settingsGrid}>
        <div className={styles.rowHint}>
          Đăng ký địa chỉ này trong Google Calendar / Apple Calendar để việc có hạn và sự kiện tự hiện (kèm nhắc trước 30 phút
          cho việc, 15 phút cho sự kiện), kể cả khi không mở ứng dụng. Chỉ gồm tiêu đề, không có nội dung chi tiết.
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            readOnly
            value={url}
            aria-label="Địa chỉ lịch"
            onFocus={(e) => e.currentTarget.select()}
            style={{
              flex: 1,
              minWidth: 0,
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              background: 'var(--canvas-bg)',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontFamily: 'ui-monospace, Consolas, monospace',
            }}
          />
          <Button variant="outline" onClick={copy} disabled={!url}>
            <Copy size={14} /> Sao chép
          </Button>
        </div>

        <div className={styles.rowHint}>
          Google Calendar: <b>Cài đặt → Thêm lịch → Từ URL</b>, dán địa chỉ trên. Lịch được làm mới khoảng vài giờ một lần.
          {isLocal && (
            <span style={{ color: '#b06000' }}>
              {' '}
              Lưu ý: hiện máy chủ đang chạy ở <code>localhost</code> nên Google không truy cập được — cần triển khai công khai trước.
            </span>
          )}
        </div>

        <div>
          <Button variant="ghost" size="sm" onClick={() => setConfirmRotate(true)}>
            Tạo lại địa chỉ (huỷ địa chỉ cũ)
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmRotate}
        title="Tạo lại địa chỉ lịch?"
        description="Địa chỉ cũ sẽ ngừng hoạt động ngay; bạn phải đăng ký lại địa chỉ mới trong Google Calendar. Dùng khi địa chỉ bị lộ."
        confirmLabel="Tạo lại"
        variant="warning"
        onConfirm={() => {
          rotate.mutate();
          setConfirmRotate(false);
        }}
        onCancel={() => setConfirmRotate(false)}
      />
    </div>
  );
}
