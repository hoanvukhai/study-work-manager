'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getObjects, AppObject } from '@/lib/objects-api';
import { getSpaces, Space } from '@/lib/spaces-api';
import WeeklyCalendar from '@/components/views/WeeklyCalendar';
import CreateObjectModal from '@/components/objects/CreateObjectModal';
import EditObjectModal from '@/components/objects/EditObjectModal';
import { Calendar as CalendarIcon, Plus, Loader2 } from 'lucide-react';

export default function GlobalCalendarPage() {
  const [tasks, setTasks] = useState<AppObject[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetDateStr, setTargetDateStr] = useState<string>('');
  const [editingTask, setEditingTask] = useState<AppObject | null>(null);

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

  const handleAddTaskOnDate = (dateStr: string) => {
    setTargetDateStr(dateStr);
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
            background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CalendarIcon size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Lịch trình theo tuần
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Theo dõi hạn chót và lịch trình công việc trực quan 7 ngày
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
            onClick={() => { setTargetDateStr(''); setShowCreateModal(true); }}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Thêm công việc</span>
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', color: 'var(--text-secondary)', gap: '8px' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Đang tải lịch trình...</span>
        </div>
      ) : (
        <WeeklyCalendar
          tasks={tasks}
          onTaskUpdated={handleTaskUpdated}
          onAddTaskOnDate={handleAddTaskOnDate}
          onEditTask={task => setEditingTask(task)}
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
    </div>
  );
}
