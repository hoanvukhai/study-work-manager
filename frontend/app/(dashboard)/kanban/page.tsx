'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useObjects, useUpdateObject, useUpdateObjectLifecycle } from '@/hooks/useObjects';
import { useSpaces } from '@/hooks/useSpaces';
import { AppObject, TaskStatus } from '@/lib/objects-api';
import KanbanBoard from '@/components/views/KanbanBoard';
import CreateObjectModal from '@/components/objects/CreateObjectModal';
import EditObjectModal from '@/components/objects/EditObjectModal';
import ObjectRelationsModal from '@/components/relations/ObjectRelationsModal';
import ObjectDetailDrawer from '@/components/objects/ObjectDetailDrawer';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { KanbanSquare, Plus } from 'lucide-react';
import styles from './Kanban.module.css';

export default function GlobalKanbanPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [showCancelled, setShowCancelled] = useState(false);
  const [selectedDrawerId, setSelectedDrawerId] = useState<string | null>(null);

  const { data: spacesData = [] } = useSpaces();
  const spaces = spacesData.filter(s => !s.archivedAt);

  const { data: tasks = [], isLoading } = useObjects({
    type: 'TASK',
    spaceId: selectedSpaceId || undefined,
  });

  const updateObjectMutation = useUpdateObject();
  const updateLifecycleMutation = useUpdateObjectLifecycle();

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState<TaskStatus>('TODO');
  const [editingTask, setEditingTask] = useState<AppObject | null>(null);
  const [relationsTask, setRelationsTask] = useState<AppObject | null>(null);

  // Confirm delete dialog state
  const [taskToDelete, setTaskToDelete] = useState<AppObject | null>(null);

  const handleTaskUpdated = (updated: AppObject) => {
    updateObjectMutation.mutate({
      id: updated.id,
      payload: {
        status: updated.status,
        title: updated.title,
        description: updated.description,
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    const task = taskToDelete;
    setTaskToDelete(null);

    // Call soft delete / TRASH on backend (Fixing BUG-02)
    updateLifecycleMutation.mutate(
      { id: task.id, action: 'TRASH' },
      {
        onSuccess: () => {
          addToast({
            title: 'Đã chuyển vào Thùng rác',
            description: `Công việc "${task.title}" đã được đưa vào Thùng rác.`,
            variant: 'info',
            action: {
              label: 'Hoàn tác',
              onClick: () => {
                updateLifecycleMutation.mutate({ id: task.id, action: 'RESTORE' });
              },
            },
          });
        },
        onError: () => {
          addToast({
            title: 'Lỗi',
            description: 'Không thể xoá công việc.',
            variant: 'danger',
          });
        },
      },
    );
  };

  const handleAddTaskInColumn = (status: TaskStatus) => {
    setCreateInitialStatus(status);
    setShowCreateModal(true);
  };

  return (
    <div className={styles.container}>
      {/* Header toolbar */}
      <div className={styles.headerToolbar}>
        <div className={styles.titleArea}>
          <div className={styles.titleIcon}>
            <KanbanSquare size={20} />
          </div>
          <div>
            <h1 className={styles.titleText}>Bảng việc Kanban</h1>
            <p className={styles.subtitle}>
              Kéo thả các thẻ công việc để chuyển đổi trạng thái tiến độ
            </p>
          </div>
        </div>

        {/* Space Filter & Add Button */}
        <div className={styles.actions}>
          <div style={{ width: '220px' }}>
            <Select
              value={selectedSpaceId}
              onChange={e => setSelectedSpaceId(e.target.value)}
            >
              <option value="">-- Tất cả Không gian --</option>
              {spaces.map(s => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </Select>
          </div>

          <Button
            variant={showCancelled ? 'secondary' : 'outline'}
            onClick={() => setShowCancelled(!showCancelled)}
            title="Bật/tắt hiển thị cột công việc đã hủy"
          >
            {showCancelled ? 'Ẩn cột Đã hủy' : 'Hiện cột Đã hủy'}
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              setCreateInitialStatus('TODO');
              setShowCreateModal(true);
            }}
          >
            <Plus size={16} /> Thêm công việc
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className={styles.boardContainer}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <Skeleton height="350px" />
            <Skeleton height="350px" />
            <Skeleton height="350px" />
          </div>
        ) : tasks.length === 0 && !selectedSpaceId ? (
          <EmptyState
            icon={<KanbanSquare size={36} />}
            title="Chưa có công việc nào"
            description="Hãy tạo công việc mới để bắt đầu quản lý tiến độ trên bảng Kanban."
            action={
              <Button
                variant="primary"
                onClick={() => {
                  setCreateInitialStatus('TODO');
                  setShowCreateModal(true);
                }}
              >
                <Plus size={16} /> Tạo công việc đầu tiên
              </Button>
            }
          />
        ) : (
          <KanbanBoard
            tasks={tasks}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={task => setTaskToDelete(task)}
            onEditTask={task => setEditingTask(task)}
            onOpenRelations={task => setRelationsTask(task)}
            onAddTask={handleAddTaskInColumn}
            onSelectTask={task => setSelectedDrawerId(task.id)}
            showCancelled={showCancelled}
          />
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateObjectModal
          spaceId={selectedSpaceId || undefined}
          initialType="TASK"
          initialStatus={createInitialStatus}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['objects'] });
            addToast({
              title: 'Thành công',
              description: 'Đã tạo công việc mới.',
              variant: 'success',
            });
          }}
        />
      )}

      {/* Edit Modal */}
      {editingTask && (
        <EditObjectModal
          object={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdated={updated => {
            handleTaskUpdated(updated);
            setEditingTask(null);
            addToast({
              title: 'Thành công',
              description: 'Đã cập nhật công việc.',
              variant: 'success',
            });
          }}
        />
      )}

      {/* Relations Modal */}
      {relationsTask && (
        <ObjectRelationsModal
          object={relationsTask}
          onClose={() => setRelationsTask(null)}
        />
      )}

      {/* Detail Drawer */}
      {selectedDrawerId && (
        <ObjectDetailDrawer
          objectId={selectedDrawerId}
          onClose={() => setSelectedDrawerId(null)}
          onSelectObject={id => setSelectedDrawerId(id)}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(taskToDelete)}
        title="Xoá công việc?"
        description={`Bạn có chắc muốn chuyển công việc "${taskToDelete?.title}" vào Thùng rác? Bạn có thể khôi phục lại sau.`}
        confirmLabel="Chuyển vào Thùng rác"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
