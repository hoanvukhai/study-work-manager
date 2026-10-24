'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useAdminStats, useAdminUsers, useAuditLogs, useBroadcast, useSetLocked } from '@/hooks/useAdmin';
import type { AdminUser } from '@/lib/admin-api';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import styles from './Admin.module.css';

type Tab = 'users' | 'stats' | 'broadcast' | 'audit';

const TABS: { id: Tab; label: string }[] = [
  { id: 'users', label: 'Người dùng' },
  { id: 'stats', label: 'Thống kê' },
  { id: 'broadcast', label: 'Thông báo hệ thống' },
  { id: 'audit', label: 'Nhật ký' },
];

const ACTION_LABEL: Record<string, string> = {
  LOCK_USER: 'Khoá tài khoản',
  UNLOCK_USER: 'Mở khoá tài khoản',
  BROADCAST: 'Gửi thông báo hệ thống',
};

const TYPE_LABEL: Record<string, string> = { TASK: 'Công việc', NOTE: 'Ghi chú', EVENT: 'Sự kiện', REFERENCE: 'Tài liệu' };

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—');

function UsersTab() {
  const toast = useToast();
  const { user: me } = useAuth();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<AdminUser | null>(null);

  // Chờ người dùng gõ xong 300ms mới tìm
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(input);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [input]);

  const { data, isLoading, isError } = useAdminUsers(search, page);
  const setLocked = useSetLocked();

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const confirm = () => {
    if (!target) return;
    const locking = !target.lockedAt;
    setLocked.mutate(
      { id: target.id, locked: locking },
      {
        onSuccess: () => toast.success(locking ? `Đã khoá ${target.email}` : `Đã mở khoá ${target.email}`),
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Không thực hiện được'),
        onSettled: () => setTarget(null),
      },
    );
  };

  return (
    <div className={styles.panel}>
      <input
        className={styles.search}
        type="search"
        placeholder="Tìm theo tên hoặc email..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {isLoading && <Skeleton height={200} />}
      {isError && <div className={styles.empty}>Không tải được danh sách.</div>}
      {data && data.items.length === 0 && <div className={styles.empty}>Không có tài khoản phù hợp.</div>}

      {data && data.items.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tài khoản</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Đăng nhập cuối</th>
              <th>Không gian</th>
              <th>Mục</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.items.map((u) => (
              <tr key={u.id}>
                <td data-label="Tài khoản">
                  <div>{u.fullName}</div>
                  <div className={styles.muted}>{u.email}</div>
                </td>
                <td data-label="Vai trò">
                  <span className={`${styles.pill} ${u.role === 'ADMIN' ? styles.pillAdmin : ''}`}>{u.role === 'ADMIN' ? 'Admin' : 'Người dùng'}</span>
                </td>
                <td data-label="Trạng thái">
                  <span className={`${styles.pill} ${u.lockedAt ? styles.pillLocked : styles.pillOk}`}>{u.lockedAt ? 'Đã khoá' : 'Hoạt động'}</span>
                </td>
                <td data-label="Ngày tạo">{fmtDate(u.createdAt)}</td>
                <td data-label="Đăng nhập cuối">{fmtDate(u.lastLoginAt)}</td>
                <td data-label="Không gian">{u.spacesCount}</td>
                <td data-label="Mục">{u.objectsCount}</td>
                <td>
                  {u.id !== me?.id && (u.lockedAt || u.role !== 'ADMIN') && (
                    <Button variant={u.lockedAt ? 'outline' : 'danger'} size="sm" onClick={() => setTarget(u)}>
                      {u.lockedAt ? 'Mở khoá' : 'Khoá'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {data && (
        <div className={styles.pager}>
          <span>
            {data.total} tài khoản · Trang {page}/{totalPages}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Trước
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Sau
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title={target?.lockedAt ? 'Mở khoá tài khoản?' : 'Khoá tài khoản?'}
        description={
          target?.lockedAt
            ? `${target?.email} sẽ đăng nhập lại được.`
            : `${target?.email} sẽ không đăng nhập được và phiên hiện tại bị chặn ngay. Dữ liệu của họ vẫn được giữ nguyên.`
        }
        confirmLabel={target?.lockedAt ? 'Mở khoá' : 'Khoá'}
        variant={target?.lockedAt ? 'primary' : 'danger'}
        onConfirm={confirm}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}

function BarChart({ title, values, dates, alt }: { title: string; values: number[]; dates: string[]; alt?: boolean }) {
  const max = Math.max(1, ...values);
  return (
    <div>
      <div className={styles.chartTitle}>{title}</div>
      <div className={styles.bars}>
        {values.map((v, i) => (
          <div key={dates[i]} className={styles.barCol} title={`${dates[i]}: ${v}`}>
            <span>{v || ''}</span>
            <div
              className={`${styles.bar} ${alt ? styles.barAlt : ''} ${v === 0 ? styles.barEmpty : ''}`}
              style={{ height: `${Math.max(3, (v / max) * 80)}%` }}
            />
            <span>{dates[i].slice(8)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsTab() {
  const { data, isLoading, isError } = useAdminStats();
  if (isLoading) return <Skeleton height={240} />;
  if (isError || !data) return <div className={styles.empty}>Không tải được thống kê.</div>;
  const dates = data.last14Days.map((d) => d.date);

  return (
    <div className={styles.panel}>
      <div className={styles.cards}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.totalUsers}</div>
          <div className={styles.statLabel}>Tổng người dùng</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.activeUsers7d}</div>
          <div className={styles.statLabel}>Đăng nhập trong 7 ngày</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.lockedUsers}</div>
          <div className={styles.statLabel}>Đang bị khoá</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.spacesTotal}</div>
          <div className={styles.statLabel}>Không gian</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data.flashcardsTotal}</div>
          <div className={styles.statLabel}>Thẻ ôn tập</div>
        </div>
        {Object.entries(data.objectsByType).map(([type, count]) => (
          <div key={type} className={styles.statCard}>
            <div className={styles.statValue}>{count}</div>
            <div className={styles.statLabel}>{TYPE_LABEL[type] ?? type}</div>
          </div>
        ))}
      </div>
      <BarChart title="Tài khoản đăng ký mới (14 ngày)" values={data.last14Days.map((d) => d.newUsers)} dates={dates} />
      <BarChart title="Mục được tạo mới (14 ngày)" values={data.last14Days.map((d) => d.newObjects)} dates={dates} alt />
      <div className={styles.muted}>Chỉ là số lượng tổng hợp — quản trị viên không xem được nội dung của người dùng.</div>
    </div>
  );
}

function BroadcastTab() {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [confirming, setConfirming] = useState(false);
  const broadcast = useBroadcast();

  const send = () => {
    broadcast.mutate(
      { title, message },
      {
        onSuccess: (r) => {
          toast.success(`Đã gửi tới ${r.recipients} người dùng`);
          setTitle('');
          setMessage('');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Không gửi được'),
        onSettled: () => setConfirming(false),
      },
    );
  };

  return (
    <div className={styles.panel}>
      <div className={styles.form}>
        <label className={styles.field}>
          Tiêu đề
          <input className={styles.input} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Bảo trì hệ thống" />
        </label>
        <label className={styles.field}>
          Nội dung
          <textarea className={styles.textarea} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Nội dung thông báo gửi tới mọi người dùng..." />
        </label>
        <div>
          <Button variant="primary" disabled={!title.trim() || !message.trim() || broadcast.isPending} onClick={() => setConfirming(true)}>
            Gửi tới tất cả người dùng
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirming}
        title="Gửi thông báo tới tất cả người dùng?"
        description="Thông báo sẽ xuất hiện trong chuông của mọi tài khoản không bị khoá và không thể thu hồi."
        confirmLabel="Gửi"
        variant="primary"
        onConfirm={send}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}

function AuditTab() {
  const { data, isLoading } = useAuditLogs();
  return (
    <div className={styles.panel}>
      {isLoading && <Skeleton height={160} />}
      {data && data.length === 0 && <div className={styles.empty}>Chưa có hành động quản trị nào.</div>}
      {data?.map((l) => (
        <div key={l.id} className={styles.log}>
          <span>
            <b>{ACTION_LABEL[l.action] ?? l.action}</b>
            {l.targetEmail ? ` — ${l.targetEmail}` : ''}
            {!l.targetEmail && l.detail ? ` — ${l.detail}` : ''}
          </span>
          <span className={styles.muted}>
            {l.adminEmail} · {fmtDate(l.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('users');

  useEffect(() => {
    if (!loading && user && user.role !== 'ADMIN') {
      toast.error('Chỉ quản trị viên mới vào được khu vực này');
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  if (loading || !user || user.role !== 'ADMIN') return <Skeleton height={300} />;

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>
          <Shield size={22} color="var(--primary-blue)" /> Khu vực Quản trị
        </h1>
        <p className={styles.sub}>Quản lý tài khoản và theo dõi hệ thống.</p>
      </div>
      <div className={styles.privacy}>Quản trị viên chỉ thấy thông tin tài khoản và số liệu tổng hợp, không xem được nội dung công việc, ghi chú hay Không gian của người dùng.</div>

      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'stats' && <StatsTab />}
      {tab === 'broadcast' && <BroadcastTab />}
      {tab === 'audit' && <AuditTab />}
    </div>
  );
}
