'use client';

import React, { useState, useMemo } from 'react';
import { AppObject, updateObject } from '@/lib/objects-api';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar as CalendarIcon,
  Plus,
  Clock,
} from 'lucide-react';

interface Props {
  tasks: AppObject[];
  onTaskUpdated: (updated: AppObject) => void;
  onAddTaskOnDate?: (dateStr: string) => void;
  onEditTask?: (task: AppObject) => void;
  onSelectTask?: (task: AppObject) => void;
}

const DAY_NAMES = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export default function WeeklyCalendar({
  tasks,
  onTaskUpdated,
  onAddTaskOnDate,
  onEditTask,
  onSelectTask,
}: Props) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  // Week calculation
  const { weekDays, isCurrentWeek } = useMemo(() => {
    const today = new Date();
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

  // Month calculation
  const { monthDays, currentMonthLabel, isCurrentMonth } = useMemo(() => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();

    const firstDayIndex = (new Date(targetYear, targetMonth, 1).getDay() + 6) % 7;
    const startDate = new Date(targetYear, targetMonth, 1 - firstDayIndex);
    startDate.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 35; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
      const inCurrentMonth = d.getMonth() === targetMonth;

      days.push({
        date: d,
        isToday,
        inCurrentMonth,
        name: DAY_NAMES[i % 7],
      });
    }

    return {
      monthDays: days,
      currentMonthLabel: `${MONTH_NAMES[targetMonth]}, ${targetYear}`,
      isCurrentMonth: monthOffset === 0,
    };
  }, [monthOffset]);

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

  // Helper matching date
  const getItemsForDate = (dateStr: string) => {
    return tasks.filter((t) => {
      if (t.type === 'EVENT') {
        const s = t.startAt ? t.startAt.split('T')[0] : null;
        const e = t.endAt ? t.endAt.split('T')[0] : s;
        if (s && e) {
          return dateStr >= s && dateStr <= e;
        }
        return s === dateStr;
      }
      if (t.dueDate) {
        return t.dueDate.split('T')[0] === dateStr;
      }
      return false;
    });
  };

  const startFormatted = weekDays[0].date.toLocaleDateString('vi-VN');
  const endFormatted = weekDays[6].date.toLocaleDateString('vi-VN');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Calendar Header Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface)',
          padding: '12px 18px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={18} color="var(--primary-blue)" />
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {viewMode === 'week' ? `${startFormatted} – ${endFormatted}` : currentMonthLabel}
          </span>
          {(viewMode === 'week' ? isCurrentWeek : isCurrentMonth) && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--primary-blue)',
              }}
            >
              {viewMode === 'week' ? 'Tuần này' : 'Tháng này'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View Mode Toggle (Tuần / Tháng) */}
          <div
            style={{
              display: 'flex',
              background: 'var(--surface-hover)',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setViewMode('week')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === 'week' ? 'var(--surface)' : 'transparent',
                color: viewMode === 'week' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'week' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Xem theo Tuần
            </button>
            <button
              onClick={() => setViewMode('month')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === 'month' ? 'var(--surface)' : 'transparent',
                color: viewMode === 'month' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'month' ? 'var(--shadow-sm)' : 'none',
              }}
            >
              Xem theo Tháng
            </button>
          </div>

          <button
            onClick={() => {
              if (viewMode === 'week') setWeekOffset(0);
              else setMonthOffset(0);
            }}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              background: 'var(--background)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            Hôm nay
          </button>
          <button
            onClick={() => {
              if (viewMode === 'week') setWeekOffset((p) => p - 1);
              else setMonthOffset((p) => p - 1);
            }}
            title="Trước"
            style={{
              padding: '6px 10px',
              background: 'var(--background)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              color: 'var(--text-secondary)',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => {
              if (viewMode === 'week') setWeekOffset((p) => p + 1);
              else setMonthOffset((p) => p + 1);
            }}
            title="Sau"
            style={{
              padding: '6px 10px',
              background: 'var(--background)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              color: 'var(--text-secondary)',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Week View (7 Columns) */}
      {viewMode === 'week' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '12px',
            alignItems: 'stretch',
            minHeight: '480px',
          }}
        >
          {weekDays.map((day) => {
            const dateStr = day.date.toISOString().split('T')[0];
            const dayItems = getItemsForDate(dateStr);

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
                <div
                  style={{
                    textAlign: 'center',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: day.isToday ? 'var(--primary-blue)' : 'var(--text-secondary)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {day.name}
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: day.isToday ? 'var(--primary-blue)' : 'var(--text-primary)',
                      marginTop: '2px',
                    }}
                  >
                    {day.date.getDate()}
                  </div>
                </div>

                {/* Day Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  {dayItems.map((item) => {
                    const isDone = item.status === 'DONE';
                    const isEvent = item.type === 'EVENT';

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (onSelectTask) onSelectTask(item);
                          else if (onEditTask) onEditTask(item);
                        }}
                        style={{
                          padding: '8px 10px',
                          background: isEvent ? 'var(--tag-event-bg)' : 'var(--background)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s',
                        }}
                      >
                        {!isEvent ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(item);
                            }}
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '4px',
                              border: isDone ? 'none' : '1.5px solid var(--border-subtle)',
                              background: isDone ? '#10b981' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                              padding: 0,
                            }}
                          >
                            {isDone && <Check size={11} color="#ffffff" strokeWidth={3} />}
                          </button>
                        ) : (
                          <Clock size={12} color="var(--tag-event-text)" style={{ flexShrink: 0 }} />
                        )}
                        <span
                          style={{
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: 500,
                            color: isDone ? 'var(--text-secondary)' : isEvent ? 'var(--tag-event-text)' : 'var(--text-primary)',
                            textDecoration: isDone ? 'line-through' : 'none',
                          }}
                        >
                          {item.title}
                        </span>
                      </div>
                    );
                  })}

                  {dayItems.length === 0 && (
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        opacity: 0.6,
                      }}
                    >
                      Trống
                    </div>
                  )}
                </div>

                {/* Add button */}
                {onAddTaskOnDate && (
                  <button
                    onClick={() => onAddTaskOnDate(dateStr)}
                    style={{
                      marginTop: '8px',
                      padding: '6px',
                      border: '1px dashed var(--border-subtle)',
                      background: 'transparent',
                      borderRadius: '6px',
                      color: 'var(--text-secondary)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={12} /> Thêm việc
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Month View (5x7 Grid) */}
      {viewMode === 'month' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Day of week headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '8px',
              textAlign: 'center',
            }}
          >
            {DAY_NAMES.map((name) => (
              <div
                key={name}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  padding: '6px 0',
                }}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Month grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '8px',
            }}
          >
            {monthDays.map((day) => {
              const dateStr = day.date.toISOString().split('T')[0];
              const dayItems = getItemsForDate(dateStr);

              return (
                <div
                  key={dateStr}
                  style={{
                    minHeight: '100px',
                    padding: '8px',
                    background: day.isToday ? 'rgba(59, 130, 246, 0.05)' : 'var(--surface)',
                    border: day.isToday ? '2px solid var(--primary-blue)' : '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    opacity: day.inCurrentMonth ? 1 : 0.45,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: day.isToday ? 700 : 500,
                        color: day.isToday ? 'var(--primary-blue)' : 'var(--text-primary)',
                      }}
                    >
                      {day.date.getDate()}
                    </span>
                    {onAddTaskOnDate && (
                      <button
                        onClick={() => onAddTaskOnDate(dateStr)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          padding: 2,
                        }}
                        title="Thêm mục vào ngày này"
                      >
                        <Plus size={12} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflow: 'hidden' }}>
                    {dayItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (onSelectTask) onSelectTask(item);
                          else if (onEditTask) onEditTask(item);
                        }}
                        style={{
                          fontSize: '11px',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          background: item.type === 'EVENT' ? 'var(--tag-event-bg)' : 'var(--surface-hover)',
                          color: item.type === 'EVENT' ? 'var(--tag-event-text)' : 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                        }}
                      >
                        {item.title}
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        +{dayItems.length - 3} mục khác
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
