'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, FolderOpen, Loader2, CheckSquare, Check, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getSpaces, Space } from '@/lib/spaces-api';
import { getObjects, updateObject, AppObject, Priority } from '@/lib/objects-api';
import CreateSpaceModal from '@/components/spaces/CreateSpaceModal';

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  LOW: { label: 'Thấp', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  MEDIUM: { label: 'Trung bình', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  HIGH: { label: 'Cao', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  URGENT: { label: 'Khẩn cấp', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [tasks, setTasks] = useState<AppObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [spacesData, tasksData] = await Promise.all([
        getSpaces().catch(() => []),
        getObjects({ type: 'TASK' }).catch(() => []),
      ]);
      setSpaces(spacesData.filter(s => !s.parentId));
      setTasks(tasksData);
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
    } catch {
      setTasks(prev => prev.map(t => (t.id === task.id ? task : t)));
    }
  };

  const firstName = user?.fullName?.split(' ').pop() || 'bạn';
  const pendingTasks = tasks.filter(t => t.status !== 'DONE');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome */}
      <div className="card">
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Xin chào {firstName} 👋
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Hệ thống Quản lý Học tập & Công việc cá nhân. Chọn một Không gian bên dưới để bắt đầu.
        </p>
      </div>

      {/* Spaces list */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Không gian của bạn
          </h2>
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
            textAlign: 'center', padding: '40px 20px',
            border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)',
          }}>
            <FolderOpen size={44} color="var(--border-subtle)" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px', fontWeight: 600 }}>
              Chưa có Không gian nào
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Không gian giúp bạn phân nhóm và quản lý các công việc, ghi chú theo từng môn học hoặc dự án.
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 18px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                background: 'var(--primary-blue)', color: 'white', border: 'none', cursor: 'pointer',
              }}
            >
              <Plus size={16} /> Tạo Không gian đầu tiên
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {spaces.map(space => (
              <Link key={space.id} href={`/spaces/${space.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px',
                border: `1px solid ${space.color}44`,
                borderRadius: 'var(--radius-md)',
                background: space.color + '0d',
                textDecoration: 'none', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = space.color + '22'; e.currentTarget.style.borderColor = space.color + '88'; }}
                onMouseLeave={e => { e.currentTarget.style.background = space.color + '0d'; e.currentTarget.style.borderColor = space.color + '44'; }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: space.color + '33', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                }}>
                  {space.icon}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {space.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {space._count?.spaceObjects ?? 0} mục
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Active Tasks Widget */}
      {tasks.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={18} color="var(--primary-blue)" />
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Công việc đang làm ({pendingTasks.length})
              </h2>
            </div>
          </div>

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
        </div>
      )}

      {showModal && (
        <CreateSpaceModal
          onClose={() => setShowModal(false)}
          onCreated={handleSpaceCreated}
        />
      )}
    </div>
  );
}