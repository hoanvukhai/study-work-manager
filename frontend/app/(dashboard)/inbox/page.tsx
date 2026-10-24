'use client';

import React, { useState } from 'react';
import {
  Inbox as InboxIcon,
  Plus,
  CheckSquare,
  FileText,
  Calendar,
  Link2,
  Trash2,
  Archive,
  Clock,
  ExternalLink,
} from 'lucide-react';
import styles from './Inbox.module.css';
import { useObjects, useCreateObject, useUpdateObject, useUpdateObjectLifecycle } from '@/hooks/useObjects';
import { ObjectType, Priority, TaskStatus } from '@/lib/objects-api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import ObjectDetailDrawer from '@/components/objects/ObjectDetailDrawer';

const TYPE_CONFIG: Record<
  ObjectType,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  TASK: {
    label: 'Công việc',
    icon: <CheckSquare size={16} />,
    color: 'var(--tag-task-text)',
    bg: 'var(--tag-task-bg)',
  },
  NOTE: {
    label: 'Ghi chú',
    icon: <FileText size={16} />,
    color: 'var(--tag-note-text)',
    bg: 'var(--tag-note-bg)',
  },
  EVENT: {
    label: 'Sự kiện',
    icon: <Calendar size={16} />,
    color: 'var(--tag-event-text)',
    bg: 'var(--tag-event-bg)',
  },
  REFERENCE: {
    label: 'Tham khảo',
    icon: <Link2 size={16} />,
    color: 'var(--tag-ref-text)',
    bg: 'var(--tag-ref-bg)',
  },
};

export default function InboxPage() {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickType, setQuickType] = useState<ObjectType>('TASK');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const { data: objects = [], isLoading } = useObjects({
    unassigned: true,
    lifecycle: 'ACTIVE',
  });

  const createObjectMutation = useCreateObject();
  const updateObjectMutation = useUpdateObject();
  const updateLifecycleMutation = useUpdateObjectLifecycle();
  const toast = useToast();

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    try {
      await createObjectMutation.mutateAsync({
        title: quickTitle.trim(),
        type: quickType,
        status: quickType === 'TASK' ? 'TODO' : undefined,
        priority: 'MEDIUM',
      });
      setQuickTitle('');
      toast.success('Đã thêm mục vào Hộp nhận');
    } catch {
      toast.error('Không thể tạo mục');
    }
  };

  const handleToggleTask = async (e: React.MouseEvent, id: string, currentStatus: TaskStatus | null) => {
    e.stopPropagation();
    const newStatus: TaskStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    try {
      await updateObjectMutation.mutateAsync({
        id,
        payload: { status: newStatus },
      });
      toast.success(newStatus === 'DONE' ? 'Đã hoàn thành công việc' : 'Đã chuyển về Cần làm');
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await updateLifecycleMutation.mutateAsync({ id, action: 'ARCHIVE' });
      toast.success('Đã lưu trữ mục', {
        action: {
          label: 'Hoàn tác',
          onClick: () => updateLifecycleMutation.mutate({ id, action: 'RESTORE' }),
        },
      });
    } catch {
      toast.error('Không thể lưu trữ');
    }
  };

  const handleTrash = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await updateLifecycleMutation.mutateAsync({ id, action: 'TRASH' });
      toast.success('Đã chuyển vào Thùng rác', {
        action: {
          label: 'Hoàn tác',
          onClick: () => updateLifecycleMutation.mutate({ id, action: 'RESTORE' }),
        },
      });
    } catch {
      toast.error('Không thể chuyển vào thùng rác');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            <InboxIcon size={24} style={{ color: 'var(--primary-blue)' }} />
            Hộp nhận
          </h1>
          <p className={styles.subtitle}>
            Thu thập nhanh ý tưởng, công việc và tài liệu chưa phân loại vào Không gian nào.
          </p>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form className={styles.quickAddCard} onSubmit={handleQuickAdd}>
        <div className={styles.quickAddRow}>
          <input
            className={styles.quickAddInput}
            placeholder="Nhập nhanh việc cần làm, ý tưởng ghi chú... (Enter để tạo)"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!quickTitle.trim() || createObjectMutation.isPending}
          >
            <Plus size={16} /> Thêm nhanh
          </Button>
        </div>
        <div className={styles.typePills}>
          {(['TASK', 'NOTE', 'EVENT', 'REFERENCE'] as ObjectType[]).map((t) => (
            <button
              key={t}
              type="button"
              className={`${styles.typePill} ${quickType === t ? styles.typePillActive : ''}`}
              onClick={() => setQuickType(t)}
            >
              {TYPE_CONFIG[t].icon}
              <span>{TYPE_CONFIG[t].label}</span>
            </button>
          ))}
        </div>
      </form>

      {/* Content List */}
      {isLoading ? (
        <div className={styles.list}>
          <Skeleton height="56px" />
          <Skeleton height="56px" />
          <Skeleton height="56px" />
        </div>
      ) : objects.length === 0 ? (
        <EmptyState
          icon={<InboxIcon size={36} />}
          title="Hộp nhận trống"
          description="Tất cả đối tượng đã được phân loại vào các Không gian hoặc chưa có mục nào. Hãy dùng thanh nhập nhanh bên trên để tạo mục mới!"
        />
      ) : (
        <div className={styles.list}>
          {objects.map((obj) => {
            const isDone = obj.status === 'DONE';
            return (
              <div
                key={obj.id}
                className={styles.itemCard}
                onClick={() => setSelectedObjectId(obj.id)}
              >
                <div className={styles.itemLeft}>
                  {obj.type === 'TASK' ? (
                    <input
                      type="checkbox"
                      checked={isDone}
                      onClick={(e) => handleToggleTask(e, obj.id, obj.status)}
                      onChange={() => {}}
                      style={{ cursor: 'pointer', width: 18, height: 18 }}
                    />
                  ) : (
                    <span
                      style={{
                        color: TYPE_CONFIG[obj.type].color,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {TYPE_CONFIG[obj.type].icon}
                    </span>
                  )}

                  <div className={styles.itemInfo}>
                    <span
                      className={styles.itemTitle}
                      style={{
                        textDecoration: isDone ? 'line-through' : 'none',
                        color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                      }}
                    >
                      {obj.title}
                    </span>
                    <div className={styles.itemMeta}>
                      <span>{TYPE_CONFIG[obj.type].label}</span>
                      {obj.dueDate && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} />
                          {new Date(obj.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                      {obj.url && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ExternalLink size={12} />
                          {(() => {
                            try {
                              return new URL(obj.url).hostname;
                            } catch {
                              return obj.url;
                            }
                          })()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.itemActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={(e) => handleArchive(e, obj.id)}
                    title="Lưu trữ"
                  >
                    <Archive size={16} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={(e) => handleTrash(e, obj.id)}
                    title="Chuyển vào thùng rác"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer */}
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
