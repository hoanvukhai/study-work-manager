'use client';

import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckSquare,
  FileText,
  Calendar,
  Link2,
} from 'lucide-react';
import styles from './Trash.module.css';
import {
  useObjects,
  useUpdateObjectLifecycle,
  useDeleteObject,
  useEmptyTrash,
} from '@/hooks/useObjects';
import { ObjectType } from '@/lib/objects-api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import ObjectDetailDrawer from '@/components/objects/ObjectDetailDrawer';

const TYPE_CONFIG: Record<
  ObjectType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  TASK: {
    label: 'Công việc',
    icon: <CheckSquare size={16} />,
    color: 'var(--tag-task-text)',
  },
  NOTE: {
    label: 'Ghi chú',
    icon: <FileText size={16} />,
    color: 'var(--tag-note-text)',
  },
  EVENT: {
    label: 'Sự kiện',
    icon: <Calendar size={16} />,
    color: 'var(--tag-event-text)',
  },
  REFERENCE: {
    label: 'Tham khảo',
    icon: <Link2 size={16} />,
    color: 'var(--tag-ref-text)',
  },
};

export default function TrashPage() {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data: objects = [], isLoading } = useObjects({
    lifecycle: 'TRASH',
  });

  const updateLifecycleMutation = useUpdateObjectLifecycle();
  const deleteObjectMutation = useDeleteObject();
  const emptyTrashMutation = useEmptyTrash();
  const toast = useToast();

  const handleRestore = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await updateLifecycleMutation.mutateAsync({ id, action: 'RESTORE' });
      toast.success('Đã khôi phục thành công');
    } catch {
      toast.error('Không thể khôi phục mục');
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteObjectMutation.mutateAsync(deleteTargetId);
      setDeleteTargetId(null);
      toast.success('Đã xoá vĩnh viễn mục');
    } catch {
      toast.error('Không thể xoá mục');
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await emptyTrashMutation.mutateAsync();
      setShowEmptyConfirm(false);
      toast.success('Đã dọn sạch thùng rác thành công');
    } catch {
      toast.error('Không thể dọn sạch thùng rác');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            <Trash2 size={24} style={{ color: 'var(--danger)' }} />
            Thùng rác
          </h1>
          <p className={styles.subtitle}>
            Các mục bị xoá được lưu trữ tạm thời tại đây. Bạn có thể khôi phục về các Không gian ban đầu hoặc dọn sạch vĩnh viễn.
          </p>
        </div>

        {objects.length > 0 && (
          <Button
            variant="outline"
            style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
            onClick={() => setShowEmptyConfirm(true)}
            disabled={emptyTrashMutation.isPending}
          >
            <Trash2 size={16} /> Dọn sạch thùng rác
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className={styles.list}>
          <Skeleton height="56px" />
          <Skeleton height="56px" />
          <Skeleton height="56px" />
        </div>
      ) : objects.length === 0 ? (
        <EmptyState
          icon={<Trash2 size={36} />}
          title="Thùng rác trống"
          description="Hiện tại không có mục nào trong thùng rác."
        />
      ) : (
        <div className={styles.list}>
          {objects.map((obj) => (
            <div
              key={obj.id}
              className={styles.itemCard}
              onClick={() => setSelectedObjectId(obj.id)}
            >
              <div className={styles.itemLeft}>
                <span style={{ color: TYPE_CONFIG[obj.type].color }}>
                  {TYPE_CONFIG[obj.type].icon}
                </span>
                <div className={styles.itemInfo}>
                  <span className={styles.itemTitle}>{obj.title}</span>
                  <div className={styles.itemMeta}>
                    <span>{TYPE_CONFIG[obj.type].label}</span>
                    {obj.deletedAt && (
                      <span>
                        Xoá lúc: {new Date(obj.deletedAt).toLocaleString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.itemActions}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleRestore(e, obj.id)}
                  title="Khôi phục lại"
                >
                  <RotateCcw size={14} /> Khôi phục
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  style={{ color: 'var(--danger)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTargetId(obj.id);
                  }}
                  title="Xoá vĩnh viễn"
                >
                  <Trash2 size={14} /> Xoá
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty Trash Confirm Dialog */}
      <ConfirmDialog
        isOpen={showEmptyConfirm}
        title="Dọn sạch Thùng rác?"
        message="Hành động này sẽ xoá vĩnh viễn tất cả các mục trong thùng rác và không thể khôi phục lại. Bạn có chắc chắn?"
        confirmLabel="Dọn sạch"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleEmptyTrash}
        onCancel={() => setShowEmptyConfirm(false)}
      />

      {/* Delete Single Item Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Xoá vĩnh viễn mục này?"
        message="Mục này sẽ bị xoá hoàn toàn khỏi hệ thống và không thể khôi phục. Bạn có chắc chắn?"
        confirmLabel="Xoá vĩnh viễn"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handlePermanentDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Object Detail Drawer */}
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
