'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, FolderOpen, CheckSquare, Check, Calendar,
  Clock, AlertTriangle, CheckCircle2, TrendingUp, KanbanSquare,
  ArrowRight, Sparkles, ChevronRight, Play,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useDashboardSummary } from '@/hooks/useViews';
import { useSpaces } from '@/hooks/useSpaces';
import { useUpdateObject, useCreateObject } from '@/hooks/useObjects';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import CreateSpaceModal from '@/components/spaces/CreateSpaceModal';
import ObjectDetailDrawer from '@/components/objects/ObjectDetailDrawer';
import TodayPlan from '@/components/planning/TodayPlan';
import { AppObject, Priority } from '@/lib/objects-api';
import { Space } from '@/lib/spaces-api';
import styles from './Dashboard.module.css';

const PRIORITY_BADGE_VARIANT: Record<Priority, 'default' | 'success' | 'warning' | 'danger'> = {
  LOW: 'success',
  MEDIUM: 'default',
  HIGH: 'warning',
  URGENT: 'danger',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  URGENT: 'Khẩn cấp',
};

function formatDeadlineRelative(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: `Quá hạn ${Math.abs(diffDays)} ngày`, isOverdue: true };
  if (diffDays === 0) return { text: 'Hôm nay', isToday: true };
  if (diffDays === 1) return { text: 'Ngày mai', isTomorrow: true };
  return { text: `${diffDays} ngày tới`, isUpcoming: true };
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const { data: summary, isLoading: loadingSummary } = useDashboardSummary();
  const { data: spacesData = [], isLoading: loadingSpaces } = useSpaces();
  const updateObjectMutation = useUpdateObject();
  const createObjectMutation = useCreateObject();

  const [showModal, setShowModal] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const spaces = spacesData.filter(s => !s.archivedAt);
  const tasks = summary?.recentTasks || [];
  const upcoming = summary?.upcomingDeadlines || [];
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');

  const handleSpaceCreated = (space: Space) => {
    toast.success(`Không gian "${space.name}" đã được tạo thành công.`);
    router.push(`/spaces/${space.id}`);
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    try {
      await createObjectMutation.mutateAsync({
        title: quickTitle.trim(),
        type: 'TASK',
        status: 'TODO',
        priority: 'MEDIUM',
      });
      setQuickTitle('');
      toast.success('Đã thêm việc mới vào Hộp nhận');
    } catch {
      toast.error('Không thể tạo việc nhanh');
    }
  };

  const handleToggleTask = (e: React.MouseEvent, task: AppObject) => {
    e.stopPropagation();
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    updateObjectMutation.mutate(
      { id: task.id, payload: { status: nextStatus } },
      {
        onSuccess: () => {
          toast.success(nextStatus === 'DONE' ? 'Đã hoàn thành công việc' : 'Đã mở lại công việc');
        },
        onError: () => {
          toast.error('Không thể cập nhật trạng thái công việc');
        },
      },
    );
  };

  const firstName = user?.fullName?.split(' ').pop() || 'bạn';
  const counts = summary?.counts || {
    spacesTotal: spaces.length,
    tasksTotal: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
    overdue: 0,
    notesTotal: 0,
    completionRate: 0,
  };

  return (
    <div className={styles.container}>
      {/* Welcome & Progress Overview Banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.bannerText}>
          <div className={styles.badgeHeader}>
            <Sparkles size={18} color="var(--primary-blue)" />
            <span className={styles.badgeLabel}>Tổng quan ngày mới</span>
          </div>
          <h1 className={styles.bannerTitle}>Xin chào {firstName} 👋</h1>
          <p className={styles.bannerSubtitle}>
            Chào mừng bạn trở lại! Dưới đây là tiến độ học tập và các hạn chót cần lưu ý hôm nay.
          </p>
        </div>

        {/* Completion Rate Pill */}
        <div className={styles.progressPill}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Tiến độ công việc</span>
            <span className={styles.progressPercent}>{counts.completionRate}%</span>
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${counts.completionRate}%` }}
            />
          </div>
          <div className={styles.progressFooter}>
            <span>Đã làm: {counts.done}/{counts.tasksTotal} việc</span>
            <span>{counts.notesTotal} ghi chú</span>
          </div>
        </div>
      </div>

      {/* Quick Add Bar (UI-06) */}
      <form onSubmit={handleQuickAdd} className={styles.quickAddCard}>
        <input
          type="text"
          className={styles.quickAddInput}
          placeholder="Thêm nhanh việc cần làm hôm nay... (Nhấn Enter để tạo)"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!quickTitle.trim() || createObjectMutation.isPending}
        >
          <Plus size={16} /> Thêm việc
        </Button>
      </form>

      {/* Gợi ý hôm nay làm gì (Trụ Kế hoạch) */}
      <TodayPlan onSelect={setSelectedObjectId} />

      {/* Tiếp tục dở dang (Resume In-Progress Tasks - UI-06) */}
      {inProgressTasks.length > 0 && (
        <div className={styles.resumeCard}>
          <div className={styles.resumeHeader}>
            <div className={styles.resumeTitle}>
              <span className={styles.pulseDot} />
              <span>Tiếp tục dở dang ({inProgressTasks.length})</span>
            </div>
            <Link
              href="/kanban"
              style={{
                fontSize: 12,
                color: 'var(--primary-blue)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Xem bảng Kanban <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {inProgressTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedObjectId(task.id)}
                style={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {task.title}
                  </div>
                  {task.spaceObjects?.[0]?.space && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {task.spaceObjects[0].space.icon} {task.spaceObjects[0].space.name}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleToggleTask(e, task)}
                  title="Đánh dấu hoàn thành"
                >
                  <Check size={12} /> Xong
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stat Cards (5 metrics) */}
      <div className={styles.kpiGrid}>
        {/* Card 1: Spaces */}
        <div className={styles.kpiCard}>
          <div
            className={styles.kpiIconWrapper}
            style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}
          >
            <FolderOpen size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>
              {loadingSummary ? <Skeleton width="30px" height="24px" /> : counts.spacesTotal}
            </div>
            <div className={styles.kpiLabel}>Không gian</div>
          </div>
        </div>

        {/* Card 2: To Do */}
        <div className={styles.kpiCard}>
          <div
            className={styles.kpiIconWrapper}
            style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>
              {loadingSummary ? <Skeleton width="30px" height="24px" /> : counts.todo}
            </div>
            <div className={styles.kpiLabel}>Cần làm</div>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className={styles.kpiCard}>
          <div
            className={styles.kpiIconWrapper}
            style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}
          >
            <TrendingUp size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>
              {loadingSummary ? <Skeleton width="30px" height="24px" /> : counts.inProgress}
            </div>
            <div className={styles.kpiLabel}>Đang thực hiện</div>
          </div>
        </div>

        {/* Card 4: Done */}
        <div className={styles.kpiCard}>
          <div
            className={styles.kpiIconWrapper}
            style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>
              {loadingSummary ? <Skeleton width="30px" height="24px" /> : counts.done}
            </div>
            <div className={styles.kpiLabel}>Hoàn thành</div>
          </div>
        </div>

        {/* Card 5: Overdue */}
        <div className={`${styles.kpiCard} ${counts.overdue > 0 ? styles.kpiCardOverdue : ''}`}>
          <div
            className={styles.kpiIconWrapper}
            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <div
              className={styles.kpiValue}
              style={counts.overdue > 0 ? { color: 'var(--danger)' } : undefined}
            >
              {loadingSummary ? <Skeleton width="30px" height="24px" /> : counts.overdue}
            </div>
            <div
              className={styles.kpiLabel}
              style={counts.overdue > 0 ? { color: 'var(--danger)' } : undefined}
            >
              Việc quá hạn
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access to Views: Kanban & Weekly Calendar */}
      <div className={styles.quickNavGrid}>
        <Link href="/kanban" className={styles.quickNavLink}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <KanbanSquare size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Bảng việc Kanban
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Kéo thả trạng thái giữa Cần làm, Đang làm & Hoàn thành
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-secondary)" />
        </Link>

        <Link href="/calendar" className={styles.quickNavLink}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Lịch trình theo tuần
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Theo dõi tiến độ từ Thứ Hai tới Chủ Nhật
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="var(--text-secondary)" />
        </Link>
      </div>

      {/* Main Grid: Spaces & Active Tasks on Left, Upcoming Deadlines on Right */}
      <div className={styles.mainGrid}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Spaces Section */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <FolderOpen size={18} color="var(--primary-blue)" />
                Không gian của bạn ({spaces.length})
              </h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowModal(true)}
              >
                <Plus size={15} /> Thêm Không gian
              </Button>
            </div>

            {loadingSpaces ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton height="56px" />
                <Skeleton height="56px" />
              </div>
            ) : spaces.length === 0 ? (
              <EmptyState
                icon={<FolderOpen size={36} />}
                title="Chưa có Không gian nào"
                description="Tạo Không gian để phân loại môn học và công việc cá nhân."
                action={
                  <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
                    <Plus size={15} /> Tạo Không gian đầu tiên
                  </Button>
                }
              />
            ) : (
              <div className={styles.spacesGrid}>
                {spaces.map(space => (
                  <Link
                    key={space.id}
                    href={`/spaces/${space.id}`}
                    className={styles.spaceItem}
                    style={{
                      border: `1px solid ${space.color || '#3b82f6'}44`,
                      backgroundColor: `${space.color || '#3b82f6'}0d`,
                    }}
                  >
                    <div
                      className={styles.spaceItemIcon}
                      style={{ background: `${space.color || '#3b82f6'}26` }}
                    >
                      {space.icon}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div
                        style={{
                          fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                      >
                        {space.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {space._count?.spaceObjects ?? 0} mục
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Active Tasks Widget */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <CheckSquare size={18} color="var(--primary-blue)" />
                Công việc gần đây
              </h2>
              <Link
                href="/kanban"
                style={{
                  fontSize: '13px', color: 'var(--primary-blue)', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                Xem tất cả trên Kanban <ArrowRight size={13} />
              </Link>
            </div>

            {loadingSummary ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton height="40px" />
                <Skeleton height="40px" />
                <Skeleton height="40px" />
              </div>
            ) : tasks.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '12px 0' }}>
                Chưa có công việc nào. Bạn hãy vào từng Không gian để thêm việc mới.
              </p>
            ) : (
              <div className={styles.taskList}>
                {tasks.slice(0, 6).map(task => {
                  const isDone = task.status === 'DONE';
                  const pVariant = task.priority ? PRIORITY_BADGE_VARIANT[task.priority] : 'default';
                  const pLabel = task.priority ? PRIORITY_LABELS[task.priority] : null;
                  const spaceObj = task.spaceObjects?.[0]?.space;

                  return (
                    <div
                      key={task.id}
                      className={`${styles.taskItem} ${isDone ? styles.taskItemDone : ''}`}
                      onClick={() => setSelectedObjectId(task.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleToggleTask(e, task)}
                        className={`${styles.checkboxBtn} ${isDone ? styles.checkboxBtnDone : ''}`}
                      >
                        {isDone && <Check size={13} color="#ffffff" strokeWidth={3} />}
                      </button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '14px', fontWeight: 500,
                            color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
                            textDecoration: isDone ? 'line-through' : 'none',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}
                        >
                          {task.title}
                        </div>
                      </div>

                      {spaceObj && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/spaces/${spaceObj.id}`);
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '2px 8px', borderRadius: '12px',
                            background: `${spaceObj.color || '#3b82f6'}22`,
                            color: 'var(--text-primary)',
                            fontSize: '11px', textDecoration: 'none', flexShrink: 0,
                            cursor: 'pointer',
                          }}
                        >
                          <span>{spaceObj.icon}</span>
                          <span>{spaceObj.name}</span>
                        </div>
                      )}

                      {pLabel && (
                        <Badge variant={pVariant}>{pLabel}</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          {/* Upcoming Deadlines Widget */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Clock size={18} color="var(--warning)" />
                Hạn chót 7 ngày tới ({upcoming.length})
              </h2>
              <Link
                href="/calendar"
                style={{
                  fontSize: '13px', color: 'var(--primary-blue)', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                Xem Lịch <ArrowRight size={13} />
              </Link>
            </div>

            {loadingSummary ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton height="50px" />
                <Skeleton height="50px" />
              </div>
            ) : upcoming.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 size={32} color="var(--success)" />}
                title="Không có hạn chót gấp!"
                description="Bạn không có công việc nào đến hạn trong vòng 7 ngày tới."
              />
            ) : (
              <div className={styles.deadlinesList}>
                {upcoming.map(task => {
                  const rel = task.dueDate ? formatDeadlineRelative(task.dueDate) : null;
                  const spaceObj = task.spaceObjects?.[0]?.space;
                  const pVariant = task.priority ? PRIORITY_BADGE_VARIANT[task.priority] : 'default';
                  const pLabel = task.priority ? PRIORITY_LABELS[task.priority] : null;

                  return (
                    <div
                      key={task.id}
                      className={`${styles.deadlineItem} ${rel?.isOverdue ? styles.deadlineItemOverdue : ''}`}
                      onClick={() => setSelectedObjectId(task.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div
                          style={{
                            fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                          }}
                        >
                          {task.title}
                        </div>

                        {rel && (
                          <Badge variant={rel.isOverdue ? 'danger' : rel.isToday ? 'warning' : 'default'}>
                            {rel.text}
                          </Badge>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          fontSize: '11px', color: 'var(--text-secondary)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {spaceObj && (
                            <span>{spaceObj.icon} {spaceObj.name}</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {pLabel && <Badge variant={pVariant}>{pLabel}</Badge>}
                          <span>•</span>
                          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : ''}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className={styles.tipCard}>
            <h3 className={styles.tipTitle}>💡 Mẹo quản lý hiệu quả</h3>
            <ul className={styles.tipList}>
              <li>Dùng <strong>Bảng Kanban</strong> để kéo thả chuyển trạng thái công việc nhanh chóng.</li>
              <li>Sử dụng nút <strong>🔗 Liên kết</strong> để đính kèm tài liệu tham khảo vào từng bài tập/dự án.</li>
              <li>Đặt <strong>Hạn chót</strong> để được nhắc nhở kịp thời trên Lịch trình tuần.</li>
              <li>Nhấn phím <strong>C</strong> bất kỳ lúc nào để tạo nhanh đối tượng mới.</li>
            </ul>
          </div>
        </div>
      </div>

      {showModal && (
        <CreateSpaceModal
          onClose={() => setShowModal(false)}
          onCreated={handleSpaceCreated}
        />
      )}

      {selectedObjectId && (
        <ObjectDetailDrawer
          objectId={selectedObjectId}
          onClose={() => setSelectedObjectId(null)}
          onSelectObject={(id) => setSelectedObjectId(id)}
        />
      )}
    </div>
  );
}