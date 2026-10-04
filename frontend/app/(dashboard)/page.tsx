'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, FolderOpen, Loader2, CheckSquare, Check, Calendar,
  Clock, AlertTriangle, CheckCircle2, TrendingUp, KanbanSquare,
  ArrowRight, Sparkles, FileText, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getSpaces, Space } from '@/lib/spaces-api';
import { updateObject, AppObject, Priority } from '@/lib/objects-api';
import { getDashboardSummary, DashboardSummaryResponse } from '@/lib/views-api';
import CreateSpaceModal from '@/components/spaces/CreateSpaceModal';

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  LOW: { label: 'Thấp', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  MEDIUM: { label: 'Trung bình', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  HIGH: { label: 'Cao', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  URGENT: { label: 'Khẩn cấp', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
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

  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [tasks, setTasks] = useState<AppObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumData, spacesData] = await Promise.all([
        getDashboardSummary().catch(() => null),
        getSpaces().catch(() => []),
      ]);

      if (sumData) {
        setSummary(sumData);
        setTasks(sumData.recentTasks || []);
      }
      setSpaces(spacesData.filter(s => !s.parentId));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSpaceCreated = (space: Space) => {
    setSpaces(prev => [...prev, space]);
    router.push(`/spaces/${space.id}`);
  };

  const handleToggleTask = async (task: AppObject) => {
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, status: nextStatus } : t)));

    try {
      await updateObject(task.id, { status: nextStatus });
      // Refresh summary numbers
      getDashboardSummary().then(res => setSummary(res)).catch(() => {});
    } catch {
      setTasks(prev => prev.map(t => (t.id === task.id ? task : t)));
    }
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

  const upcoming = summary?.upcomingDeadlines || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome & Progress Overview Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-lg, 16px)',
        padding: '24px 28px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
      }}>
        <div style={{ minWidth: '260px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Sparkles size={18} color="#6366f1" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tổng quan ngày mới
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Xin chào {firstName} 👋
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Chào mừng bạn trở lại! Dưới đây là tiến độ học tập và các hạn chót cần lưu ý hôm nay.
          </p>
        </div>

        {/* Completion Rate Pill */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '16px 20px',
          minWidth: '220px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Tiến độ công việc
            </span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>
              {counts.completionRate}%
            </span>
          </div>
          <div style={{
            height: '8px',
            background: 'var(--border-subtle)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${counts.completionRate}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #10b981)',
              borderRadius: '4px',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>Đã làm: {counts.done}/{counts.tasksTotal} việc</span>
            <span>{counts.notesTotal} ghi chú</span>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards (5 metrics) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
      }}>
        {/* Card 1: Spaces */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FolderOpen size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {counts.spacesTotal}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Không gian
            </div>
          </div>
        </div>

        {/* Card 2: To Do */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {counts.todo}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Cần làm
            </div>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {counts.inProgress}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Đang thực hiện
            </div>
          </div>
        </div>

        {/* Card 4: Done */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {counts.done}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Hoàn thành
            </div>
          </div>
        </div>

        {/* Card 5: Overdue */}
        <div style={{
          background: counts.overdue > 0 ? 'rgba(239, 68, 68, 0.08)' : 'var(--surface)',
          border: `1px solid ${counts.overdue > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'}`,
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: counts.overdue > 0 ? '#ef4444' : 'var(--text-primary)' }}>
              {counts.overdue}
            </div>
            <div style={{ fontSize: '12px', color: counts.overdue > 0 ? '#ef4444' : 'var(--text-secondary)', fontWeight: 500 }}>
              Việc quá hạn
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access to Views: Kanban & Weekly Calendar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '12px',
      }}>
        <Link
          href="/kanban"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', borderRadius: '12px',
            background: 'var(--surface)', border: '1px solid var(--border-subtle)',
            textDecoration: 'none', transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#6366f1';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.12)', color: '#6366f1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
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

        <Link
          href="/calendar"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', borderRadius: '12px',
            background: 'var(--surface)', border: '1px solid var(--border-subtle)',
            textDecoration: 'none', transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
        gap: '20px',
      }}>
        {/* Left Column: Spaces & Recent Active Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Spaces Section */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderOpen size={18} color="var(--primary-blue)" />
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Không gian của bạn ({spaces.length})
                </h2>
              </div>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  background: 'var(--primary-blue)', color: 'white', border: 'none', cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <Plus size={15} /> Thêm Không gian
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', padding: '20px 0' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Đang tải dữ liệu...
              </div>
            ) : spaces.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '36px 20px',
                border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)',
              }}>
                <FolderOpen size={40} color="var(--border-subtle)" style={{ marginBottom: '12px' }} />
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px', fontWeight: 600 }}>
                  Chưa có Không gian nào
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Tạo Không gian để phân loại môn học và công việc cá nhân.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    background: 'var(--primary-blue)', color: 'white', border: 'none', cursor: 'pointer',
                  }}
                >
                  <Plus size={15} /> Tạo Không gian đầu tiên
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {spaces.map(space => (
                  <Link
                    key={space.id}
                    href={`/spaces/${space.id}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px',
                      border: `1px solid ${space.color}44`,
                      borderRadius: 'var(--radius-md)',
                      background: space.color + '0d',
                      textDecoration: 'none', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = space.color + '22';
                      e.currentTarget.style.borderColor = space.color + '88';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = space.color + '0d';
                      e.currentTarget.style.borderColor = space.color + '44';
                    }}
                  >
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      background: space.color + '33', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                    }}>
                      {space.icon}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={18} color="var(--primary-blue)" />
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Công việc gần đây
                </h2>
              </div>
              <Link
                href="/kanban"
                style={{ fontSize: '13px', color: 'var(--primary-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Xem tất cả trên Kanban <ArrowRight size={13} />
              </Link>
            </div>

            {tasks.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '12px 0' }}>
                Chưa có công việc nào. Bạn hãy vào từng Không gian để thêm việc mới.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tasks.slice(0, 6).map(task => {
                  const isDone = task.status === 'DONE';
                  const pConfig = PRIORITY_CONFIG[task.priority];
                  const spaceObj = task.spaceObjects?.[0]?.space;

                  return (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 14px', borderRadius: '8px',
                        background: isDone ? 'var(--canvas-bg)' : 'var(--surface)',
                        border: '1px solid var(--border-subtle)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <button
                        onClick={() => handleToggleTask(task)}
                        style={{
                          width: '20px', height: '20px', borderRadius: '5px',
                          border: isDone ? 'none' : '2px solid var(--border-subtle)',
                          background: isDone ? '#10b981' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', flexShrink: 0, padding: 0,
                        }}
                      >
                        {isDone && <Check size={13} color="#ffffff" strokeWidth={3} />}
                      </button>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '14px', fontWeight: 500,
                          color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
                          textDecoration: isDone ? 'line-through' : 'none',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {task.title}
                        </div>
                      </div>

                      {spaceObj && (
                        <Link
                          href={`/spaces/${spaceObj.id}`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '2px 8px', borderRadius: '12px',
                            background: spaceObj.color + '22', color: 'var(--text-primary)',
                            fontSize: '11px', textDecoration: 'none', flexShrink: 0,
                          }}
                        >
                          <span>{spaceObj.icon}</span>
                          <span>{spaceObj.name}</span>
                        </Link>
                      )}

                      {pConfig && (
                        <span style={{
                          fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px',
                          background: pConfig.bg, color: pConfig.color, flexShrink: 0,
                        }}>
                          {pConfig.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#f59e0b" />
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Hạn chót 7 ngày tới ({upcoming.length})
                </h2>
              </div>
              <Link
                href="/calendar"
                style={{ fontSize: '13px', color: 'var(--primary-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Xem Lịch <ArrowRight size={13} />
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px 16px',
                border: '1px dashed var(--border-subtle)', borderRadius: '10px',
              }}>
                <CheckCircle2 size={32} color="#10b981" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  Không có hạn chót gấp!
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Bạn không có công việc nào đến hạn trong vòng 7 ngày tới.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcoming.map(task => {
                  const rel = task.dueDate ? formatDeadlineRelative(task.dueDate) : null;
                  const spaceObj = task.spaceObjects?.[0]?.space;
                  const pConfig = PRIORITY_CONFIG[task.priority];

                  return (
                    <div
                      key={task.id}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: rel?.isOverdue ? 'rgba(239, 68, 68, 0.06)' : 'var(--surface)',
                        border: `1px solid ${rel?.isOverdue ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-subtle)'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{
                          fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                        }}>
                          {task.title}
                        </div>

                        {rel && (
                          <span style={{
                            fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px',
                            background: rel.isOverdue
                              ? 'rgba(239, 68, 68, 0.15)'
                              : rel.isToday
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'var(--border-subtle)',
                            color: rel.isOverdue ? '#ef4444' : rel.isToday ? '#f59e0b' : 'var(--text-secondary)',
                            flexShrink: 0,
                          }}>
                            {rel.text}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {spaceObj && (
                            <span>{spaceObj.icon} {spaceObj.name}</span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {pConfig && (
                            <span style={{ color: pConfig.color, fontWeight: 600 }}>
                              {pConfig.label}
                            </span>
                          )}
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

          {/* Quick Tips / Info card */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px 18px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              💡 Mẹo quản lý hiệu quả
            </h3>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>Dùng <strong>Bảng Kanban</strong> để kéo thả chuyển trạng thái công việc nhanh chóng.</li>
              <li>Sử dụng nút <strong>🔗 Liên kết</strong> để đính kèm tài liệu tham khảo vào từng bài tập/dự án.</li>
              <li>Đặt <strong>Hạn chót</strong> để được nhắc nhở kịp thời trên Lịch trình tuần.</li>
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
    </div>
  );
}