'use client';

import React, { useState, useMemo } from 'react';
import { AppObject, updateObject } from '@/lib/objects-api';
import { ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, Plus } from 'lucide-react';

interface Props {
  tasks: AppObject[];
  onTaskUpdated: (updated: AppObject) => void;
  onAddTaskOnDate?: (dateStr: string) => void;
  onEditTask?: (task: AppObject) => void;
}

const DAY_NAMES = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

export default function WeeklyCalendar({
  tasks,
  onTaskUpdated,
  onAddTaskOnDate,
  onEditTask,
}: Props) {
  // Current week offset: 0 = this week, -1 = last week, +1 = next week
  const [weekOffset, setWeekOffset] = useState(0);

  // Calculate Monday of the targeted week
  const { weekDays, isCurrentWeek } = useMemo(() => {
    const today = new Date();
    // Monday as day 0
    const dayOfWeek = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
      days.push({ date: d, isToday, name: DAY_NAMES[i] });
    }

    return { weekDays: days, isCurrentWeek: weekOffset === 0 };
  }, [weekOffset]);

  const handleToggle = async (task: AppObject) => {
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    onTaskUpdated({ ...task, status: nextStatus });
    try {
      const updated = await updateObject(task.id, { status: nextStatus });
      onTaskUpdated(updated);
    } catch {
      onTaskUpdated(task);
    }
  };

  const startFormatted = weekDays[0].date.toLocaleDateString('vi-VN');
  const endFormatted = weekDays[6].date.toLocaleDateString('vi-VN');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Calendar Header Navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface)', padding: '12px 18px', borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={18} color="var(--primary-blue)" />
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {startFormatted} – {endFormatted}
          </span>
          {isCurrentWeek && (
            <span style={{
              fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-blue)',
            }}>
              Tuần này
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setWeekOffset(0)}
            style={{
              padding: '6px 12px', fontSize: '12px', fontWeight: 600,
              background: 'var(--background)', border: '1px solid var(--border-subtle)',
              borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setWeekOffset(p => p - 1)}
            title="Tuần trước"
            style={{
              padding: '6px 10px', background: 'var(--background)', border: '1px solid var(--border-subtle)',
              borderRadius: '6px', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setWeekOffset(p => p + 1)}
            title="Tuần sau"
            style={{
              padding: '6px 10px', background: 'var(--background)', border: '1px solid var(--border-subtle)',
              borderRadius: '6px', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 7-Day Columns Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '12px',
        alignItems: 'stretch',
        minHeight: '480px',
      }}>
        {weekDays.map(day => {
          const dateStr = day.date.toISOString().split('T')[0];
          // Find tasks due on this date
          const dayTasks = tasks.filter(t => {
            if (!t.dueDate) return false;
            return t.dueDate.split('T')[0] === dateStr;
          });

          return (
            <div
              key={dateStr}
              style={{
                background: day.isToday ? 'rgba(59, 130, 246, 0.04)' : 'var(--surface)',
                border: day.isToday ? '2px solid var(--primary-blue)' : '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Day header */}
              <div style={{
                textAlign: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '10px',
              }}>
                <div style={{
                  fontSize: '12px', fontWeight: 600,
                  color: day.isToday ? 'var(--primary-blue)' : 'var(--text-secondary)',
                  textTransform: 'uppercase',
                }}>
                  {day.name}
                </div>
                <div style={{
                  fontSize: '18px', fontWeight: 700,
                  color: day.isToday ? 'var(--primary-blue)' : 'var(--text-primary)',
                  marginTop: '2px',
                }}>
                  {day.date.getDate()}
                </div>
              </div>

              {/* Day tasks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                {dayTasks.map(task => {
                  const isDone = task.status === 'DONE';
                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask?.(task)}
                      style={{
                        padding: '8px 10px',
                        background: 'var(--background)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary-blue)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    >
                      <button
                        onClick={e => { e.stopPropagation(); handleToggle(task); }}
                        style={{
                          width: '16px', height: '16px', borderRadius: '4px',
                          border: isDone ? 'none' : '1.5px solid var(--border-subtle)',
                          background: isDone ? '#10b981' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', flexShrink: 0, padding: 0,
                        }}
                      >
                        {isDone && <Check size={11} color="#ffffff" strokeWidth={3} />}
                      </button>
                      <span style={{
                        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontWeight: 500, color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
                        textDecoration: isDone ? 'line-through' : 'none',
                      }}>
                        {task.title}
                      </span>
                    </div>
                  );
                })}

                {dayTasks.length === 0 && (
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)', fontSize: '11px', opacity: 0.6,
                  }}>
                    Không có hạn
                  </div>
                )}
              </div>

              {/* Add button */}
              {onAddTaskOnDate && (
                <button
                  onClick={() => onAddTaskOnDate(dateStr)}
                  style={{
                    marginTop: '8px', padding: '6px', border: '1px dashed var(--border-subtle)',
                    background: 'transparent', borderRadius: '6px', color: 'var(--text-secondary)',
                    fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '4px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-blue)'; e.currentTarget.style.color = 'var(--primary-blue)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Plus size={12} /> Thêm việc
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
