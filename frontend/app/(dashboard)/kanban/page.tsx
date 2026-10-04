'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getObjects, AppObject, TaskStatus } from '@/lib/objects-api';
import { getSpaces, Space } from '@/lib/spaces-api';
import KanbanBoard from '@/components/views/KanbanBoard';
import CreateObjectModal from '@/components/objects/CreateObjectModal';
import EditObjectModal from '@/components/objects/EditObjectModal';
import ObjectRelationsModal from '@/components/relations/ObjectRelationsModal';
import { KanbanSquare, Plus, Loader2 } from 'lucide-react';

export default function GlobalKanbanPage() {
  const [tasks, setTasks] = useState<AppObject[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState<TaskStatus>('TODO');
  const [editingTask, setEditingTask] = useState<AppObject | null>(null);
  const [relationsTask, setRelationsTask] = useState<AppObject | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksData, spacesData] = await Promise.all([
        getObjects({ type: 'TASK', spaceId: selectedSpaceId || undefined }),
        getSpaces(),
      ]);
      setTasks(tasksData);
      setSpaces(spacesData.filter(s => !s.parentId));
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSpaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTaskUpdated = (updated: AppObject) => {
    setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  };

  const handleTaskDeleted = (task: AppObject) => {
    if (!confirm(`Xoá công việc "${task.title}"?`)) return;
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const handleAddTaskInColumn = (status: TaskStatus) => {
    setCreateInitialStatus(status);
    setShowCreateModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <KanbanSquare size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Bảng việc Kanban
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Kéo thả các thẻ công việc để chuyển đổi trạng thái tiến độ
            </p>
          </div>
        </div>

        {/* Space Filter & Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={selectedSpaceId}
            onChange={e => setSelectedSpaceId(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
              background: 'var(--surface)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="">-- Tất cả Không gian --</option>
            {spaces.map(s => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleAddTaskInColumn('TODO')}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Thêm công việc</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', color: 'var(--text-secondary)', gap: '8px' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Đang tải bảng Kanban...</span>
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          onEditTask={task => setEditingTask(task)}
          onOpenRelations={task => setRelationsTask(task)}
          onAddTask={handleAddTaskInColumn}
        />
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateObjectModal
          initialType="TASK"
          initialSpaceId={selectedSpaceId || undefined}
          onClose={() => setShowCreateModal(false)}
          onCreated={newObj => setTasks(prev => [newObj, ...prev])}
        />
      )}

      {editingTask && (
        <EditObjectModal
          object={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdated={handleTaskUpdated}
        />
      )}

      {relationsTask && (
        <ObjectRelationsModal
          currentObject={relationsTask}
          onClose={() => setRelationsTask(null)}
        />
      )}
    </div>
  );
}
