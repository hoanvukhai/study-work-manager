'use client';

import React, { useState } from 'react';
import { AppObject, TaskStatus, Priority, updateObject } from '@/lib/objects-api';
import { Calendar, Plus, MoreHorizontal, Edit3, Trash2, Link as LinkIcon, Check } from 'lucide-react';

interface Props {
  tasks: AppObject[];
  onTaskUpdated: (updated: AppObject) => void;
  onTaskDeleted?: (task: AppObject) => void;
  onEditTask?: (task: AppObject) => void;
  onOpenRelations?: (task: AppObject) => void;
  onAddTask?: (status: TaskStatus) => void;
}

const COLUMNS: { status: TaskStatus; title: string; color: string; bg: string }[] = [
  { status: 'TODO', title: 'Cần làm', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)' },
  { status: 'IN_PROGRESS', title: 'Đang thực hiện', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
  { status: 'DONE', title: 'Hoàn thành', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
];

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  LOW: { label: 'Thấp', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  MEDIUM: { label: 'Trung bình', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  HIGH: { label: 'Cao', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  URGENT: { label: 'Khẩn cấp', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
};

export default function KanbanBoard({
  tasks,
  onTaskUpdated,
  onTaskDeleted,
  onEditTask,
  onOpenRelations,
  onAddTask,
}: Props) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (dragOverCol !== status) {
      setDragOverCol(status);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === targetStatus) return;

    // Optimistic update
    const updatedTask = { ...task, status: targetStatus };
    onTaskUpdated(updatedTask);

    try {
      const saved = await updateObject(taskId, { status: targetStatus });
      onTaskUpdated(saved);
    } catch {
      // Revert on error
      onTaskUpdated(task);
    } finally {
      setDraggedTaskId(null);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      alignItems: 'start',
      minHeight: '520px',
    }}>
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.status);
        const isTarget = dragOverCol === col.status;

        return (
          <div
            key={col.status}
            onDragOver={e => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, col.status)}
            style={{
              background: isTarget ? col.bg : 'var(--surface)',
              border: isTarget ? `2px dashed ${col.color}` : '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '480px',
              transition: 'all 0.2s',
            }}
          >
            {/* Column Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: col.color,
                }} />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {col.title}
                </h3>
                <span style={{
                  fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)',
                  background: 'var(--background)', borderRadius: '12px',
                  padding: '2px 8px', border: '1px solid var(--border-subtle)',
                }}>
                  {colTasks.length}
                </span>
              </div>

              {onAddTask && (
                <button
                  onClick={() => onAddTask(col.status)}
                  title="Thêm công việc vào cột này"
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--text-secondary)', padding: '4px', borderRadius: '6px',
                    display: 'flex', alignItems: 'center',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  <Plus size={16} />
                </button>
              )}
            </div>

            {/* Task Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {colTasks.map(task => {
                const isDragging = draggedTaskId === task.id;
                const pConfig = PRIORITY_CONFIG[task.priority];
                const isDone = task.status === 'DONE';
                const isOverdue = !isDone && task.dueDate && new Date(task.dueDate) < new Date();

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={e => handleDragStart(e, task.id)}
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: 'grab',
                      opacity: isDragging ? 0.4 : 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = col.color)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                  >
                    {/* Top Row: Title & Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                      <div style={{
                        fontSize: '14px', fontWeight: 600,
                        color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        lineHeight: '1.3',
                      }}>
                        {task.title}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                        {onOpenRelations && (
                          <button
                            onClick={() => onOpenRelations(task)}
                            title="Liên kết chéo"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}
                          >
                            <LinkIcon size={13} />
                          </button>
                        )}
                        {onEditTask && (
                          <button
                            onClick={() => onEditTask(task)}
                            title="Sửa"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}
                          >
                            <Edit3 size={13} />
                          </button>
                        )}
                        {onTaskDeleted && (
                          <button
                            onClick={() => onTaskDeleted(task)}
                            title="Xoá"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description preview */}
                    {task.description && (
                      <p style={{
                        fontSize: '12px', color: 'var(--text-secondary)',
                        margin: '0 0 10px', lineHeight: '1.4',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {task.description}
                      </p>
                    )}

                    {/* Footer: Priority & Due Date */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)',
                      fontSize: '11px',
                    }}>
                      {pConfig && (
                        <span style={{
                          padding: '2px 6px', borderRadius: '10px',
                          background: pConfig.bg, color: pConfig.color, fontWeight: 600,
                        }}>
                          {pConfig.label}
                        </span>
                      )}

                      {task.dueDate && (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          color: isOverdue ? '#ef4444' : 'var(--text-secondary)',
                          fontWeight: isOverdue ? 600 : 400,
                        }}>
                          <Calendar size={11} />
                          {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                          {isOverdue && ' (!)'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flex: 1, minHeight: '120px', border: '1px dashed var(--border-subtle)',
                  borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '13px',
                }}>
                  Thả công việc vào đây
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
