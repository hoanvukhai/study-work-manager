'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useObjects, useUpdateObject } from '@/hooks/useObjects';
import { useSpaces } from '@/hooks/useSpaces';
import { AppObject } from '@/lib/objects-api';
import WeeklyCalendar from '@/components/views/WeeklyCalendar';
import CreateObjectModal from '@/components/objects/CreateObjectModal';
import EditObjectModal from '@/components/objects/EditObjectModal';
import ObjectDetailDrawer from '@/components/objects/ObjectDetailDrawer';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import styles from './CalendarPage.module.css';

export default function GlobalCalendarPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [selectedDrawerId, setSelectedDrawerId] = useState<string | null>(null);
  const { data: spacesData = [] } = useSpaces();
  const spaces = spacesData.filter(s => !s.archivedAt);

  const { data: objects = [], isLoading } = useObjects({
    spaceId: selectedSpaceId || undefined,
  });

  const updateObjectMutation = useUpdateObject();

  // Filter tasks & events that have dueDate or startAt
  const calendarItems = objects.filter(o => o.dueDate || o.startAt);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetDateStr, setTargetDateStr] = useState<string>('');
  const [editingTask, setEditingTask] = useState<AppObject | null>(null);

  const handleTaskUpdated = (updated: AppObject) => {
    updateObjectMutation.mutate({
      id: updated.id,
      payload: {
        status: updated.status,
        title: updated.title,
        dueDate: updated.dueDate,
        startAt: updated.startAt,
        endAt: updated.endAt,
      },
    });
  };

  const handleAddTaskOnDate = (dateStr: string) => {
    setTargetDateStr(dateStr);
    setShowCreateModal(true);
  };

  return (
    <div className={styles.container}>
      {/* Header toolbar */}
      <div className={styles.headerToolbar}>
        <div className={styles.titleArea}>
          <div className={styles.titleIcon}>
            <CalendarIcon size={20} />
          </div>
          <div>
            <h1 className={styles.titleText}>Lịch trình theo tuần</h1>
            <p className={styles.subtitle}>
              Theo dõi hạn chót và lịch trình công việc trực quan 7 ngày
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
            variant="primary"
            onClick={() => {
              setTargetDateStr('');
              setShowCreateModal(true);
            }}
          >
            <Plus size={16} /> Thêm việc vào lịch
          </Button>
        </div>
      </div>

      {/* Calendar view */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} height="360px" />
          ))}
        </div>
      ) : (
        <WeeklyCalendar
          tasks={calendarItems}
          onTaskUpdated={handleTaskUpdated}
          onAddTaskOnDate={handleAddTaskOnDate}
          onEditTask={task => setEditingTask(task)}
          onSelectTask={task => setSelectedDrawerId(task.id)}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateObjectModal
          spaceId={selectedSpaceId || undefined}
          initialDueDate={targetDateStr || undefined}
          initialType="TASK"
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['objects'] });
            queryClient.invalidateQueries({ queryKey: ['calendar'] });
            addToast({
              title: 'Thành công',
              description: 'Đã thêm công việc vào lịch trình.',
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
              description: 'Đã cập nhật mục lịch trình.',
              variant: 'success',
            });
          }}
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
    </div>
  );
}
