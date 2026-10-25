'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import profileStyles from '@/app/(dashboard)/profile/Profile.module.css';
import styles from './Notifications.module.css';

interface ExportData {
  counts: { spaces: number; objects: number; relations: number; flashcards: number };
}

export default function DataExportCard() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const data = await apiRequest<ExportData>('/account/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-work-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Đã tải ${data.counts.objects} mục, ${data.counts.spaces} Không gian, ${data.counts.flashcards} thẻ ôn tập`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được dữ liệu');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={profileStyles.card}>
      <div className={profileStyles.cardHeader}>
        <Download size={18} style={{ color: 'var(--primary-blue)' }} />
        <h2 className={profileStyles.cardTitle}>Dữ liệu của bạn</h2>
      </div>
      <div className={styles.settingsGrid}>
        <div className={styles.rowHint}>
          Tải toàn bộ dữ liệu của bạn (Không gian, công việc, ghi chú, sự kiện, tài liệu, liên kết, thẻ ôn tập, lịch sử học, thông báo,
          kể cả mục trong Thùng rác) dưới dạng tệp JSON để lưu trữ hoặc chuyển sang nơi khác. Tệp không chứa mật khẩu hay mã bí mật.
        </div>
        <div>
          <Button variant="outline" onClick={download} disabled={busy}>
            <Download size={14} /> {busy ? 'Đang chuẩn bị...' : 'Tải dữ liệu (JSON)'}
          </Button>
        </div>
      </div>
    </div>
  );
}
