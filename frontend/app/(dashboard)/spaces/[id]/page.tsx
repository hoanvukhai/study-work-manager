'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSpace, updateSpace, deleteSpace, Space } from '../../../../lib/spaces-api';
import {
  getObjects, updateObject, deleteObject, AppObject, ObjectType, TaskStatus, Priority,
} from '../../../../lib/objects-api';
import CreateObjectModal from '../../../../components/objects/CreateObjectModal';
import EditObjectModal from '../../../../components/objects/EditObjectModal';
import KanbanBoard from '@/components/views/KanbanBoard';
import WeeklyCalendar from '@/components/views/WeeklyCalendar';
import ObjectRelationsModal from '@/components/relations/ObjectRelationsModal';
import {
  MoreHorizontal, Edit3, Archive, Trash2, Plus, LayoutGrid, List,
  Clock, Loader2, ArrowLeft, Check, CheckSquare, Square, FileText,
  Calendar, Search, Filter, AlertCircle, KanbanSquare, Link as LinkIcon,
} from 'lucide-react';

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  LOW: { label: 'Thấp', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  MEDIUM: { label: 'Trung bình', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  HIGH: { label: 'Cao', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  URGENT: { label: 'Khẩn cấp', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
};

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const spaceId = params.id as string;

  // Space state
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showSpaceMenu, setShowSpaceMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban' | 'calendar'>('list');

  // Objects state
  const [objects, setObjects] = useState<AppObject[]>([]);
  const [loadingObjects, setLoadingObjects] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalProps, setCreateModalProps] = useState<{ initialStatus?: TaskStatus; initialDueDate?: string } | null>(null);
  const [editingObject, setEditingObject] = useState<AppObject | null>(null);
  const [relationsObject, setRelationsObject] = useState<AppObject | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filters & Search
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'TASK' | 'NOTE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TODO' | 'DONE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Load space info
  const loadSpace = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSpace(spaceId);
      setSpace(data);
      setNameInput(data.name);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải thông tin Không gian');
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  // Load objects for this space
  const loadObjects = useCallback(async () => {
    try {
      setLoadingObjects(true);
      const data = await getObjects({ spaceId });
      setObjects(data);
    } catch {
      setObjects([]);
    } finally {
      setLoadingObjects(false);
    }
  }, [spaceId]);

  useEffect(() => {
    loadSpace();
    loadObjects();
  }, [loadSpace, loadObjects]);

  // Close menus on outside click
  useEffect(() => {
    const close = () => {
      setShowSpaceMenu(false);
      setActiveMenuId(null);
    };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const handleSaveName = async () => {
    if (!space || !nameInput.trim()) return;
    try {
      const u = await updateSpace(space.id, { name: nameInput.trim() });
      setSpace(u);
    } catch {}
    setEditingName(false);
  };

  const handleArchiveSpace = async () => {
    if (!space) return;
    try {
      await updateSpace(space.id, { isArchived: true });
      router.push('/');
    } catch {}
  };

  const handleDeleteSpace = async () => {
    if (!space || !confirm('Xoá Không gian này? Các mục trong Không gian sẽ được đưa về mục Chung.')) return;
    try {
      await deleteSpace(space.id);
      router.push('/');
    } catch {}
  };

  // Toggle task DONE <-> TODO
  const handleToggleTaskStatus = async (item: AppObject) => {
    if (item.type !== 'TASK') return;
    const nextStatus: TaskStatus = item.status === 'DONE' ? 'TODO' : 'DONE';

    // Optimistic update
    setObjects(prev => prev.map(o => (o.id === item.id ? { ...o, status: nextStatus } : o)));

    try {
      const updated = await updateObject(item.id, { status: nextStatus });
      setObjects(prev => prev.map(o => (o.id === item.id ? updated : o)));
    } catch {
      // Revert on failure
      setObjects(prev => prev.map(o => (o.id === item.id ? item : o)));
    }
  };

  // Delete object
  const handleDeleteObject = async (item: AppObject) => {
    if (!confirm(`Xoá ${item.type === 'TASK' ? 'công việc' : 'ghi chú'} "${item.title}"?`)) return;
    try {
      await deleteObject(item.id);
      setObjects(prev => prev.filter(o => o.id !== item.id));
      if (space) {
        setSpace(prev => prev ? {
          ...prev,
          _count: { spaceObjects: Math.max(0, (prev._count?.spaceObjects ?? 1) - 1) },
        } : null);
      }
    } catch (err: any) {
      alert(err?.message || 'Không thể xoá mục');
    }
  };

  // Callback after creating object
  const handleObjectCreated = (newObj: AppObject) => {
    setObjects(prev => [newObj, ...prev]);
    if (space) {
      setSpace(prev => prev ? {
        ...prev,
        _count: { spaceObjects: (prev._count?.spaceObjects ?? 0) + 1 },
      } : null);
    }
  };

  // Callback after updating object
  const handleObjectUpdated = (updated: AppObject) => {
    setObjects(prev => prev.map(o => (o.id === updated.id ? updated : o)));
  };

  // Filtered & searched objects
  const filteredObjects = useMemo(() => {
    return objects.filter(item => {
      // Type filter
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;

      // Status filter (applies to Task)
      if (statusFilter !== 'ALL' && item.type === 'TASK') {
        if (statusFilter === 'DONE' && item.status !== 'DONE') return false;
        if (statusFilter === 'TODO' && item.status === 'DONE') return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description?.toLowerCase().includes(q);
        if (!inTitle && !inDesc) return false;
      }

      return true;
    });
  }, [objects, typeFilter, statusFilter, searchQuery]);

  // Statistics
  const tasksCount = objects.filter(o => o.type === 'TASK').length;
  const tasksDoneCount = objects.filter(o => o.type === 'TASK' && o.status === 'DONE').length;
  const notesCount = objects.filter(o => o.type === 'NOTE').length;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-secondary)', gap: '8px', minHeight: '300px' }}>
        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
        <span>Đang tải Không gian...</span>
      </div>
    );
  }

  if (error || !space) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px' }}>🔍</div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          {error || 'Không tìm thấy Không gian'}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, maxWidth: '400px' }}>
          Không gian này có thể đã bị xoá hoặc bạn không có quyền truy cập.
        </p>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '8px',
          background: 'var(--primary-blue)', color: 'white',
          textDecoration: 'none', fontSize: '14px', fontWeight: 500,
        }}>
          <ArrowLeft size={16} /> Quay lại Dashboard
        </Link>
      </div>
    );
  }

  const color = space.color || '#6366f1';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header Banner */}
      <div style={{
        background: color + '15',
        borderBottom: '1px solid ' + color + '33',
        padding: '30px 32px 20px',
        position: 'relative',
      }}>
        {/* Top actions: View mode & More */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('list')}
              title="Xem danh sách"
              style={{
                padding: '6px 10px', border: 'none', cursor: 'pointer', display: 'flex',
                background: viewMode === 'list' ? color + '33' : 'transparent',
                color: viewMode === 'list' ? color : 'var(--text-secondary)',
              }}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Xem lưới"
              style={{
                padding: '6px 10px', border: 'none', cursor: 'pointer', display: 'flex',
                background: viewMode === 'grid' ? color + '33' : 'transparent',
                color: viewMode === 'grid' ? color : 'var(--text-secondary)',
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              title="Bảng Kanban kéo thả"
              style={{
                padding: '6px 10px', border: 'none', cursor: 'pointer', display: 'flex',
                background: viewMode === 'kanban' ? color + '33' : 'transparent',
                color: viewMode === 'kanban' ? color : 'var(--text-secondary)',
              }}
            >
              <KanbanSquare size={16} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              title="Lịch trình tuần"
              style={{
                padding: '6px 10px', border: 'none', cursor: 'pointer', display: 'flex',
                background: viewMode === 'calendar' ? color + '33' : 'transparent',
                color: viewMode === 'calendar' ? color : 'var(--text-secondary)',
              }}
            >
              <Calendar size={16} />
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowSpaceMenu(p => !p); }}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                borderRadius: '8px', padding: '6px 10px', cursor: 'pointer',
                color: 'var(--text-secondary)', display: 'flex',
              }}
            >
              <MoreHorizontal size={16} />
            </button>

            {showSpaceMenu && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '4px', zIndex: 100,
                  background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: '10px', padding: '4px', minWidth: '180px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}
              >
                <button
                  onClick={() => { setEditingName(true); setShowSpaceMenu(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '8px 12px', borderRadius: '6px', background: 'none', border: 'none',
                    color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <Edit3 size={14} /> Đổi tên
                </button>
                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                <button
                  onClick={handleArchiveSpace}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '8px 12px', borderRadius: '6px', background: 'none', border: 'none',
                    color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <Archive size={14} /> Lưu trữ
                </button>
                <button
                  onClick={handleDeleteSpace}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                    padding: '8px 12px', borderRadius: '6px', background: 'none', border: 'none',
                    color: '#ef4444', fontSize: '14px', cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <Trash2 size={14} /> Xoá
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Space Identity */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: color + '33', border: '2px solid ' + color + '55',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', flexShrink: 0,
          }}>
            {space.icon}
          </div>

          <div style={{ flex: 1 }}>
            {editingName ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                  style={{
                    fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)',
                    background: 'var(--background)', border: '2px solid ' + color,
                    borderRadius: '8px', padding: '4px 12px', outline: 'none', maxWidth: '400px',
                  }}
                />
                <button onClick={handleSaveName} style={{
                  padding: '8px 16px', background: color, color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                }}>
                  Lưu
                </button>
                <button onClick={() => setEditingName(false)} style={{
                  padding: '8px 16px', background: 'transparent', color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)', borderRadius: '8px', cursor: 'pointer',
                }}>
                  Huỷ
                </button>
              </div>
            ) : (
              <h1
                style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, cursor: 'pointer' }}
                onDoubleClick={() => setEditingName(true)}
                title="Nhấp đúp để đổi tên"
              >
                {space.name}
              </h1>
            )}

            {space.description && (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
                {space.description}
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px', alignItems: 'center' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '3px 10px', borderRadius: '20px',
                background: color + '22', color: color, fontSize: '12px', fontWeight: 600,
              }}>
                {objects.length} mục
              </span>

              {tasksCount > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '3px 10px', borderRadius: '20px',
                  background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', fontSize: '12px', fontWeight: 600,
                }}>
                  {tasksDoneCount}/{tasksCount} việc hoàn thành
                </span>
              )}

              {notesCount > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '3px 10px', borderRadius: '20px',
                  background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', fontSize: '12px', fontWeight: 600,
                }}>
                  {notesCount} ghi chú
                </span>
              )}

              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Tạo ngày {new Date(space.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
        {/* Controls Toolbar: Filters & Add Button */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
          alignItems: 'center', gap: '16px', marginBottom: '20px',
        }}>
          {/* Left filters: Type tabs & Status */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            {/* Type tabs */}
            <div style={{
              display: 'flex', background: 'var(--surface)', border: '1px solid var(--border-subtle)',
              borderRadius: '8px', padding: '3px', gap: '2px',
            }}>
              <button
                onClick={() => setTypeFilter('ALL')}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: typeFilter === 'ALL' ? 600 : 500,
                  background: typeFilter === 'ALL' ? 'var(--primary-blue)' : 'transparent',
                  color: typeFilter === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                Tất cả ({objects.length})
              </button>

              <button
                onClick={() => setTypeFilter('TASK')}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: typeFilter === 'TASK' ? 600 : 500,
                  background: typeFilter === 'TASK' ? 'var(--primary-blue)' : 'transparent',
                  color: typeFilter === 'TASK' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                Công việc ({tasksCount})
              </button>

              <button
                onClick={() => setTypeFilter('NOTE')}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: typeFilter === 'NOTE' ? 600 : 500,
                  background: typeFilter === 'NOTE' ? 'var(--primary-blue)' : 'transparent',
                  color: typeFilter === 'NOTE' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                Ghi chú ({notesCount})
              </button>
            </div>

            {/* Status filter (if Tasks included) */}
            {typeFilter !== 'NOTE' && tasksCount > 0 && (
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                style={{
                  padding: '6px 12px', borderRadius: '8px', fontSize: '13px',
                  background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="ALL">Mọi trạng thái</option>
                <option value="TODO">Chưa hoàn thành</option>
                <option value="DONE">Đã hoàn thành</option>
              </select>
            )}

            {/* Search Input */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 12px', borderRadius: '8px',
              background: 'var(--surface)', border: '1px solid var(--border-subtle)',
              width: '220px',
            }}>
              <Search size={14} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Tìm kiếm mục..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none', background: 'transparent', outline: 'none',
                  fontSize: '13px', color: 'var(--text-primary)', width: '100%',
                }}
              />
            </div>
          </div>

          {/* Right: Add new button */}
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '14px',
              background: color, color: '#ffffff', border: 'none', cursor: 'pointer',
              boxShadow: '0 2px 8px ' + color + '44', transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus size={16} /> Thêm mục mới
          </button>
        </div>

        {/* Content list / grid / empty */}
        {loadingObjects ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'var(--text-secondary)', gap: '8px' }}>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Đang tải danh sách công việc và ghi chú...</span>
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            tasks={filteredObjects.filter(o => o.type === 'TASK')}
            onTaskUpdated={handleObjectUpdated}
            onTaskDeleted={handleDeleteObject}
            onEditTask={setEditingObject}
            onOpenRelations={setRelationsObject}
            onAddTask={(status) => {
              setCreateModalProps({ initialStatus: status });
              setShowCreateModal(true);
            }}
          />
        ) : viewMode === 'calendar' ? (
          <WeeklyCalendar
            tasks={filteredObjects.filter(o => o.type === 'TASK')}
            onTaskUpdated={handleObjectUpdated}
            onEditTask={setEditingObject}
            onAddTaskOnDate={(dateStr) => {
              setCreateModalProps({ initialDueDate: dateStr });
              setShowCreateModal(true);
            }}
          />
        ) : filteredObjects.length === 0 ? (
          /* Empty state */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '300px', textAlign: 'center',
            border: '2px dashed ' + color + '44', borderRadius: '16px', padding: '40px',
          }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>{space.icon}</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Không tìm thấy mục nào phù hợp với bộ lọc'
                : 'Không gian còn trống'}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 20px', maxWidth: '360px' }}>
              {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Hãy thử thay đổi từ khoá tìm kiếm hoặc đặt lại các bộ lọc.'
                : `Thêm Công việc hoặc Ghi chú vào ${space.name} để bắt đầu quản lý tiến độ.`}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 24px', borderRadius: '10px', fontWeight: 600, fontSize: '14px',
                background: color, color: '#ffffff', border: 'none', cursor: 'pointer',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Plus size={16} /> Thêm mục mới
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* LIST VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredObjects.map(item => {
              const isTask = item.type === 'TASK';
              const isDone = isTask && item.status === 'DONE';
              const pConfig = isTask ? PRIORITY_CONFIG[item.priority] : null;
              const isOverdue = isTask && !isDone && item.dueDate && new Date(item.dueDate) < new Date();

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 16px', borderRadius: '10px',
                    background: isDone ? 'var(--canvas-bg)' : 'var(--surface)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all 0.15s', position: 'relative',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = color + '88')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  {/* Task Checkbox / Note Icon */}
                  {isTask ? (
                    <button
                      onClick={() => handleToggleTaskStatus(item)}
                      title={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
                      style={{
                        width: '22px', height: '22px', borderRadius: '6px',
                        border: isDone ? 'none' : '2px solid var(--border-subtle)',
                        background: isDone ? '#10b981' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0, padding: 0,
                        transition: 'all 0.15s',
                      }}
                    >
                      {isDone && <Check size={14} color="#ffffff" strokeWidth={3} />}
                    </button>
                  ) : (
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '6px',
                      background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', flexShrink: 0,
                    }}>
                      📝
                    </div>
                  )}

                  {/* Title & Description */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px', fontWeight: 600,
                      color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.title}
                    </div>

                    {item.description && (
                      <div style={{
                        fontSize: '12px', color: 'var(--text-secondary)',
                        marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {item.description}
                      </div>
                    )}
                  </div>

                  {/* Badges: Priority, Due Date, Type */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {/* Priority badge */}
                    {pConfig && (
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px',
                        background: pConfig.bg, color: pConfig.color,
                      }}>
                        {pConfig.label}
                      </span>
                    )}

                    {/* Due date badge */}
                    {item.dueDate && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '11px', padding: '2px 8px', borderRadius: '12px',
                        background: isOverdue ? 'rgba(239, 68, 68, 0.15)' : 'var(--border-subtle)',
                        color: isOverdue ? '#ef4444' : 'var(--text-secondary)',
                        fontWeight: isOverdue ? 600 : 400,
                      }}>
                        <Calendar size={11} />
                        {new Date(item.dueDate).toLocaleDateString('vi-VN')}
                        {isOverdue && ' (Quá hạn)'}
                      </span>
                    )}

                    {/* Note Tag */}
                    {!isTask && (
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '12px',
                        background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', fontWeight: 500,
                      }}>
                        Ghi chú
                      </span>
                    )}
                  </div>

                  {/* Action buttons: Relations & Menu */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
                    <button
                      onClick={() => setRelationsObject(item)}
                      title="Liên kết tham chiếu"
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--text-secondary)', padding: '4px', borderRadius: '4px',
                        display: 'flex', alignItems: 'center',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary-blue)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                      <LinkIcon size={15} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === item.id ? null : item.id);
                      }}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--text-secondary)', padding: '4px', borderRadius: '4px',
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {activeMenuId === item.id && (
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: 'absolute', top: '100%', right: 0, marginTop: '4px', zIndex: 50,
                          background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                          borderRadius: '8px', padding: '4px', minWidth: '150px',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                        }}
                      >
                        <button
                          onClick={() => { setRelationsObject(item); setActiveMenuId(null); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                            padding: '6px 10px', borderRadius: '4px', background: 'none', border: 'none',
                            color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-subtle)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          <LinkIcon size={13} /> Liên kết tham chiếu
                        </button>
                        <button
                          onClick={() => { setEditingObject(item); setActiveMenuId(null); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                            padding: '6px 10px', borderRadius: '4px', background: 'none', border: 'none',
                            color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-subtle)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          <Edit3 size={13} /> Sửa
                        </button>
                        <button
                          onClick={() => { handleDeleteObject(item); setActiveMenuId(null); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                            padding: '6px 10px', borderRadius: '4px', background: 'none', border: 'none',
                            color: '#ef4444', fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >
                          <Trash2 size={13} /> Xoá
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* GRID VIEW */
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px',
          }}>
            {filteredObjects.map(item => {
              const isTask = item.type === 'TASK';
              const isDone = isTask && item.status === 'DONE';
              const pConfig = isTask ? PRIORITY_CONFIG[item.priority] : null;

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-between', gap: '12px', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = color + '88')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div>
                    {/* Card Header: Type badge & actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isTask ? (
                          <button
                            onClick={() => handleToggleTaskStatus(item)}
                            style={{
                              width: '18px', height: '18px', borderRadius: '4px',
                              border: isDone ? 'none' : '1.5px solid var(--border-subtle)',
                              background: isDone ? '#10b981' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', padding: 0,
                            }}
                          >
                            {isDone && <Check size={12} color="#ffffff" strokeWidth={3} />}
                          </button>
                        ) : (
                          <span>📝</span>
                        )}
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {isTask ? (isDone ? 'Đã xong' : 'Cần làm') : 'Ghi chú'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => setRelationsObject(item)}
                          title="Liên kết tham chiếu"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary-blue)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                        >
                          <LinkIcon size={14} />
                        </button>
                        <button
                          onClick={() => setEditingObject(item)}
                          title="Sửa"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteObject(item)}
                          title="Xoá"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Card Title */}
                    <div style={{
                      fontSize: '15px', fontWeight: 600,
                      color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      marginBottom: '6px',
                    }}>
                      {item.title}
                    </div>

                    {/* Card Description */}
                    {item.description && (
                      <p style={{
                        fontSize: '13px', color: 'var(--text-secondary)', margin: 0,
                        lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: '8px', borderTop: '1px solid var(--border-subtle)',
                    fontSize: '11px', color: 'var(--text-secondary)',
                  }}>
                    {pConfig ? (
                      <span style={{
                        padding: '2px 6px', borderRadius: '10px',
                        background: pConfig.bg, color: pConfig.color, fontWeight: 600,
                      }}>
                        {pConfig.label}
                      </span>
                    ) : (
                      <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                    )}

                    {item.dueDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} /> {new Date(item.dueDate).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateObjectModal
          initialSpaceId={spaceId}
          initialStatus={createModalProps?.initialStatus}
          initialDueDate={createModalProps?.initialDueDate}
          onClose={() => {
            setShowCreateModal(false);
            setCreateModalProps(null);
          }}
          onCreated={handleObjectCreated}
        />
      )}

      {editingObject && (
        <EditObjectModal
          object={editingObject}
          onClose={() => setEditingObject(null)}
          onUpdated={handleObjectUpdated}
        />
      )}

      {relationsObject && (
        <ObjectRelationsModal
          currentObject={relationsObject}
          onClose={() => setRelationsObject(null)}
        />
      )}
    </div>
  );
}