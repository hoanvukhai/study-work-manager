'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useSpace, useUpdateSpace, useDeleteSpace, useUpdatePlacement, useReorderSpace } from '@/hooks/useSpaces';
import SpaceSettingsDialog, { toolEnabled } from '@/components/spaces/SpaceSettingsDialog';
import {
  useObjects,
  useUpdateObject,
  useUpdateObjectLifecycle,
} from '@/hooks/useObjects';
import { AppObject, Priority, TaskStatus } from '@/lib/objects-api';
import CreateObjectModal from '@/components/objects/CreateObjectModal';
import ObjectDetailDrawer from '@/components/objects/ObjectDetailDrawer';
import { useBlockedIds } from '@/hooks/usePlanning';
import KanbanBoard from '@/components/views/KanbanBoard';
import WeeklyCalendar from '@/components/views/WeeklyCalendar';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import {
  MoreHorizontal, Edit3, Pin, ArrowUp, ArrowDown, Settings, Archive, Trash2, Plus, LayoutGrid, List,
  Clock, ArrowLeft, Check, Search, KanbanSquare, Link as LinkIcon,
  Calendar,
} from 'lucide-react';
import styles from './SpaceDetail.module.css';

const PRIORITY_BADGE_VARIANT: Record<Priority, 'default' | 'success' | 'warning' | 'danger'> = {
  LOW: 'success',
  MEDIUM: 'default',
  HIGH: 'warning',
  URGENT: 'danger',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  URGENT: 'Khẩn cấp',
};

export default function SpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const spaceId = params.id as string;

  // Space queries & mutations
  const { data: space, isLoading: loadingSpace, error } = useSpace(spaceId);
  const updateSpaceMutation = useUpdateSpace();
  const deleteSpaceMutation = useDeleteSpace();

  // Objects queries & mutations
  const { data: objects = [], isLoading: loadingObjects } = useObjects({ spaceId });
  const blockedIds = useBlockedIds();
  const updateObjectMutation = useUpdateObject();
  const updateLifecycleMutation = useUpdateObjectLifecycle();
  const placementMutation = useUpdatePlacement();
  const reorderMutation = useReorderSpace();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Local state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban' | 'calendar'>('list');
  const [selectedDrawerObjectId, setSelectedDrawerObjectId] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalProps, setCreateModalProps] = useState<{ initialStatus?: TaskStatus; initialDueDate?: string } | null>(null);

  // Dialogs state (replaces native confirms)
  const [confirmDeleteSpace, setConfirmDeleteSpace] = useState(false);
  const [objectToDelete, setObjectToDelete] = useState<AppObject | null>(null);

  // Filters & Search
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'TASK' | 'NOTE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TODO' | 'DONE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSaveName = () => {
    if (!space || !nameInput.trim()) return;
    updateSpaceMutation.mutate(
      { id: space.id, payload: { name: nameInput.trim() } },
      {
        onSuccess: () => {
          setEditingName(false);
          addToast({
            title: 'Thành công',
            description: 'Đã đổi tên Không gian.',
            variant: 'success',
          });
        },
      },
    );
  };

  const handleArchiveSpace = () => {
    if (!space) return;
    updateSpaceMutation.mutate(
      { id: space.id, payload: { isArchived: true } },
      {
        onSuccess: () => {
          addToast({
            title: 'Đã lưu trữ',
            description: `Không gian "${space.name}" đã được lưu trữ.`,
            variant: 'info',
          });
          router.push('/');
        },
      },
    );
  };

  const handleDeleteSpaceConfirm = () => {
    if (!space) return;
    setConfirmDeleteSpace(false);
    deleteSpaceMutation.mutate(space.id, {
      onSuccess: () => {
        addToast({
          title: 'Đã xoá Không gian',
          description: `Không gian "${space.name}" đã được xoá. Các mục được đưa về Hộp nhận.`,
          variant: 'info',
        });
        router.push('/');
      },
      onError: () => {
        addToast({
          title: 'Lỗi',
          description: 'Không thể xoá Không gian này.',
          variant: 'danger',
        });
      },
    });
  };

  // Toggle task DONE <-> TODO
  const handleToggleTaskStatus = (item: AppObject) => {
    if (item.type !== 'TASK') return;
    const nextStatus: TaskStatus = item.status === 'DONE' ? 'TODO' : 'DONE';
    updateObjectMutation.mutate(
      { id: item.id, payload: { status: nextStatus } },
      {
        onSuccess: () => {
          addToast({
            title: nextStatus === 'DONE' ? 'Đã hoàn thành' : 'Đã mở lại công việc',
            description: `"${item.title}"`,
            variant: 'info',
          });
        },
      },
    );
  };

  // Move object to Trash (Fixing BUG-01: Soft delete with Undo)
  const handleConfirmDeleteObject = () => {
    if (!objectToDelete) return;
    const item = objectToDelete;
    setObjectToDelete(null);

    updateLifecycleMutation.mutate(
      { id: item.id, action: 'TRASH' },
      {
        onSuccess: () => {
          addToast({
            title: 'Đã chuyển vào Thùng rác',
            description: `Mục "${item.title}" đã được đưa vào Thùng rác.`,
            variant: 'info',
            action: {
              label: 'Hoàn tác',
              onClick: () => {
                updateLifecycleMutation.mutate({ id: item.id, action: 'RESTORE' });
              },
            },
          });
        },
        onError: () => {
          addToast({
            title: 'Lỗi',
            description: 'Không thể xoá mục này.',
            variant: 'danger',
          });
        },
      },
    );
  };

  // Vị trí/ghim của một mục TRONG Không gian này (mục nằm ở nhiều Space có vị trí riêng ở mỗi nơi)
  const placementOf = useCallback(
    (o: AppObject) => {
      const p = o.spaceObjects?.find(so => so.spaceId === spaceId);
      return { position: p?.position ?? 0, isPinned: p?.isPinned ?? false };
    },
    [spaceId],
  );

  const sortedAll = useMemo(() => {
    return [...objects].sort((a, b) => {
      const pa = placementOf(a);
      const pb = placementOf(b);
      if (pa.isPinned !== pb.isPinned) return pa.isPinned ? -1 : 1;
      if (pa.position !== pb.position) return pa.position - pb.position;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [objects, placementOf]);

  // Filtered & searched objects (giữ thứ tự đã sắp)
  const filteredObjects = useMemo(() => {
    return sortedAll.filter(item => {
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
      if (statusFilter !== 'ALL' && item.type === 'TASK') {
        if (statusFilter === 'DONE' && item.status !== 'DONE') return false;
        if (statusFilter === 'TODO' && item.status === 'DONE') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description?.toLowerCase().includes(q);
        if (!inTitle && !inDesc) return false;
      }
      return true;
    });
  }, [sortedAll, typeFilter, statusFilter, searchQuery]);

  const noFilter = typeFilter === 'ALL' && statusFilter === 'ALL' && !searchQuery.trim();

  const togglePin = (item: AppObject) => {
    const pinned = placementOf(item).isPinned;
    placementMutation.mutate(
      { spaceId, objectId: item.id, patch: { isPinned: !pinned } },
      { onError: () => addToast({ title: 'Lỗi', description: 'Không ghim được mục này.', variant: 'danger' }) },
    );
  };

  // Chỉ đổi chỗ trong cùng nhóm (ghim / không ghim) và khi không đang lọc, để thứ tự thấy được = thứ tự lưu
  const moveItem = (item: AppObject, dir: -1 | 1) => {
    const ids = sortedAll.map(o => o.id);
    const i = ids.indexOf(item.id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    if (placementOf(sortedAll[i]).isPinned !== placementOf(sortedAll[j]).isPinned) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    reorderMutation.mutate(
      { spaceId, objectIds: ids },
      { onError: () => addToast({ title: 'Lỗi', description: 'Không đổi được thứ tự.', variant: 'danger' }) },
    );
  };

  // Statistics
  const tasksCount = objects.filter(o => o.type === 'TASK').length;
  const tasksDoneCount = objects.filter(o => o.type === 'TASK' && o.status === 'DONE').length;
  const notesCount = objects.filter(o => o.type === 'NOTE').length;

  if (loadingSpace) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '30px' }}>
        <Skeleton height="100px" />
        <Skeleton height="300px" />
      </div>
    );
  }

  if (error || !space) {
    return (
      <EmptyState
        title="Không tìm thấy Không gian"
        description="Không gian này có thể đã bị xoá hoặc bạn không có quyền truy cập."
        action={
          <Button variant="primary" onClick={() => router.push('/')}>
            <ArrowLeft size={16} /> Quay lại Dashboard
          </Button>
        }
      />
    );
  }

  const color = space.color || '#6366f1';
  const showKanban = toolEnabled(space.settings, 'enableKanban');
  const showCalendar = toolEnabled(space.settings, 'enableCalendar');
  const showProgress = toolEnabled(space.settings, 'enableProgress');
  const activeView = (viewMode === 'kanban' && !showKanban) || (viewMode === 'calendar' && !showCalendar) ? 'list' : viewMode;

  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <div
        className={styles.headerBanner}
        style={{
          background: `${color}15`,
          borderBottomColor: `${color}33`,
        }}
      >
        {/* Top actions: View mode & More */}
        <div className={styles.topActions}>
          <div className={styles.viewModeGroup}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="Xem danh sách"
              className={`${styles.viewModeBtn} ${viewMode === 'list' ? styles.viewModeBtnActive : ''}`}
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Xem lưới"
              className={`${styles.viewModeBtn} ${viewMode === 'grid' ? styles.viewModeBtnActive : ''}`}
            >
              <LayoutGrid size={16} />
            </button>
            {showKanban && <button
              type="button"
              onClick={() => setViewMode('kanban')}
              title="Bảng Kanban"
              className={`${styles.viewModeBtn} ${viewMode === 'kanban' ? styles.viewModeBtnActive : ''}`}
            >
              <KanbanSquare size={16} />
            </button>}
            {showCalendar && <button
              type="button"
              onClick={() => setViewMode('calendar')}
              title="Lịch trình tuần"
              className={`${styles.viewModeBtn} ${viewMode === 'calendar' ? styles.viewModeBtnActive : ''}`}
            >
              <Calendar size={16} />
            </button>}
          </div>

          <DropdownMenu
            trigger={
              <button
                type="button"
                className={styles.viewModeBtn}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <MoreHorizontal size={16} />
              </button>
            }
            items={[
              {
                label: 'Đổi tên',
                icon: <Edit3 size={14} />,
                onClick: () => {
                  setNameInput(space.name);
                  setEditingName(true);
                },
              },
              {
                label: 'Mục tiêu, hạn chót & công cụ',
                icon: <Settings size={14} />,
                onClick: () => setSettingsOpen(true),
              },
              {
                label: 'Lưu trữ Không gian',
                icon: <Archive size={14} />,
                onClick: handleArchiveSpace,
              },
              {
                label: 'Xoá Không gian',
                icon: <Trash2 size={14} />,
                danger: true,
                dividerAfter: false,
                onClick: () => setConfirmDeleteSpace(true),
              },
            ]}
          />
        </div>

        {/* Space Identity */}
        <div className={styles.identityArea}>
          <div
            className={styles.iconBox}
            style={{
              background: `${color}33`,
              border: `2px solid ${color}55`,
            }}
          >
            {space.icon}
          </div>

          <div className={styles.spaceInfo}>
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
                    fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)',
                    background: 'var(--surface)', border: `2px solid ${color}`,
                    borderRadius: 'var(--radius-sm)', padding: '4px 12px', outline: 'none',
                  }}
                />
                <Button variant="primary" size="sm" onClick={handleSaveName}>
                  Lưu
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingName(false)}>
                  Huỷ
                </Button>
              </div>
            ) : (
              <h1
                className={styles.title}
                onDoubleClick={() => {
                  setNameInput(space.name);
                  setEditingName(true);
                }}
                title="Nhấp đúp để đổi tên"
              >
                {space.name}
              </h1>
            )}

            {space.description && (
              <p className={styles.description}>{space.description}</p>
            )}

            {(space.goal || space.dueDate) && (
              <div className={styles.metaRow} style={{ marginTop: 4 }}>
                {space.goal && <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>🎯 {space.goal}</span>}
                {space.dueDate && (
                  <span
                    className={styles.metaBadge}
                    style={
                      new Date(space.dueDate).getTime() < Date.now()
                        ? { background: 'rgba(239,68,68,0.14)', color: '#dc2626' }
                        : { background: `${color}22`, color }
                    }
                  >
                    Hạn {new Date(space.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
            )}

            {showProgress && space.progress && space.progress.total > 0 && (
              <div style={{ marginTop: 10, maxWidth: 420 }} aria-label="Tiến độ Không gian">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  <span>Tiến độ</span>
                  <span>
                    {space.progress.done}/{space.progress.total} việc · {Math.round((space.progress.done / space.progress.total) * 100)}%
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(space.progress.done / space.progress.total) * 100}%`,
                      height: '100%',
                      background: color,
                      transition: 'width 0.25s',
                    }}
                  />
                </div>
              </div>
            )}

            <div className={styles.metaRow}>
              <span
                className={styles.metaBadge}
                style={{ background: `${color}22`, color }}
              >
                {objects.length} mục
              </span>

              {tasksCount > 0 && (
                <span
                  className={styles.metaBadge}
                  style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}
                >
                  {tasksDoneCount}/{tasksCount} việc hoàn thành
                </span>
              )}

              {notesCount > 0 && (
                <span
                  className={styles.metaBadge}
                  style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}
                >
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
      <div className={styles.contentArea}>
        {/* Controls Toolbar: Filters & Add Button */}
        <div className={styles.controlsToolbar}>
          <div className={styles.filterGroup}>
            {/* Type tabs */}
            <div className={styles.typeTabs}>
              <button
                type="button"
                onClick={() => setTypeFilter('ALL')}
                className={`${styles.typeTabBtn} ${typeFilter === 'ALL' ? styles.typeTabBtnActive : ''}`}
              >
                Tất cả ({objects.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('TASK')}
                className={`${styles.typeTabBtn} ${typeFilter === 'TASK' ? styles.typeTabBtnActive : ''}`}
              >
                Công việc ({tasksCount})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('NOTE')}
                className={`${styles.typeTabBtn} ${typeFilter === 'NOTE' ? styles.typeTabBtnActive : ''}`}
              >
                Ghi chú ({notesCount})
              </button>
            </div>

            {/* Status filter */}
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
            <div className={styles.searchBox}>
              <Search size={14} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Tìm kiếm mục..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} /> Thêm mục mới
          </Button>
        </div>

        {/* Views */}
        {loadingObjects ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Skeleton height="50px" />
            <Skeleton height="50px" />
            <Skeleton height="50px" />
          </div>
        ) : activeView === 'kanban' ? (
          <KanbanBoard
            blockedIds={blockedIds}
            tasks={filteredObjects.filter(o => o.type === 'TASK')}
            onTaskUpdated={updated => {
              updateObjectMutation.mutate({
                id: updated.id,
                payload: { status: updated.status, title: updated.title },
              });
            }}
            onTaskDeleted={item => setObjectToDelete(item)}
            onSelectTask={task => setSelectedDrawerObjectId(task.id)}
            onAddTask={status => {
              setCreateModalProps({ initialStatus: status });
              setShowCreateModal(true);
            }}
          />
        ) : activeView === 'calendar' ? (
          <WeeklyCalendar
            tasks={filteredObjects.filter(o => o.type === 'TASK')}
            onTaskUpdated={updated => {
              updateObjectMutation.mutate({
                id: updated.id,
                payload: { status: updated.status, dueDate: updated.dueDate },
              });
            }}
            onSelectTask={task => setSelectedDrawerObjectId(task.id)}
            onAddTaskOnDate={dateStr => {
              setCreateModalProps({ initialDueDate: dateStr });
              setShowCreateModal(true);
            }}
          />
        ) : filteredObjects.length === 0 ? (
          <EmptyState
            title={
              searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Không tìm thấy mục nào phù hợp'
                : 'Không gian còn trống'
            }
            description={
              searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Hãy thử thay đổi từ khoá tìm kiếm hoặc bộ lọc.'
                : `Thêm công việc hoặc ghi chú vào ${space.name} để bắt đầu.`
            }
            action={
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <Plus size={16} /> Thêm mục mới
              </Button>
            }
          />
        ) : activeView === 'list' ? (
          /* List View */
          <div className={styles.listView}>
            {filteredObjects.map(item => {
              const isTask = item.type === 'TASK';
              const isDone = isTask && item.status === 'DONE';
              const pVariant = item.priority ? PRIORITY_BADGE_VARIANT[item.priority] : 'default';
              const pLabel = item.priority ? PRIORITY_LABELS[item.priority] : null;

              return (
                <div
                  key={item.id}
                  className={`${styles.listItem} ${isDone ? styles.listItemDone : ''}`}
                  onClick={() => setSelectedDrawerObjectId(item.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {isTask ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTaskStatus(item);
                      }}
                      className={`${styles.checkboxBtn} ${isDone ? styles.checkboxBtnDone : ''}`}
                    >
                      {isDone && <Check size={14} color="#ffffff" strokeWidth={3} />}
                    </button>
                  ) : (
                    <span style={{ fontSize: '18px' }}>📝</span>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={`${styles.itemTitle} ${isDone ? styles.itemTitleDone : ''}`}>
                      {placementOf(item).isPinned && <span title="Đã ghim" style={{ marginRight: 4 }}>📌</span>}
                      {item.title}
                    </div>
                    {item.description && (
                      <div className={styles.itemDesc}>{item.description}</div>
                    )}
                  </div>

                  <div className={styles.badgeGroup}>
                    {pLabel && <Badge variant={pVariant}>{pLabel}</Badge>}
                    {item.dueDate && (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> {new Date(item.dueDate).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                    {!isTask && <Badge variant="default">Ghi chú</Badge>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(item);
                      }}
                      title={placementOf(item).isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                      aria-pressed={placementOf(item).isPinned}
                      className={styles.actionBtn}
                      style={placementOf(item).isPinned ? { color: color } : undefined}
                    >
                      <Pin size={15} />
                    </button>
                    {noFilter && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveItem(item, -1);
                          }}
                          title="Đưa lên"
                          aria-label="Đưa lên"
                          className={styles.actionBtn}
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveItem(item, 1);
                          }}
                          title="Đưa xuống"
                          aria-label="Đưa xuống"
                          className={styles.actionBtn}
                        >
                          <ArrowDown size={15} />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDrawerObjectId(item.id);
                      }}
                      title="Liên kết tham chiếu"
                      className={styles.actionBtn}
                    >
                      <LinkIcon size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDrawerObjectId(item.id);
                      }}
                      title="Sửa"
                      className={styles.actionBtn}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setObjectToDelete(item);
                      }}
                      title="Xoá"
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className={styles.gridView}>
            {filteredObjects.map(item => {
              const isTask = item.type === 'TASK';
              const isDone = isTask && item.status === 'DONE';
              const pVariant = item.priority ? PRIORITY_BADGE_VARIANT[item.priority] : 'default';
              const pLabel = item.priority ? PRIORITY_LABELS[item.priority] : null;

              return (
                <div
                  key={item.id}
                  className={styles.gridCard}
                  onClick={() => setSelectedDrawerObjectId(item.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className={styles.cardTop}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isTask ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTaskStatus(item);
                            }}
                            className={`${styles.checkboxBtn} ${isDone ? styles.checkboxBtnDone : ''}`}
                            style={{ width: '18px', height: '18px' }}
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
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDrawerObjectId(item.id);
                          }}
                          title="Liên kết tham chiếu"
                          className={styles.actionBtn}
                        >
                          <LinkIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDrawerObjectId(item.id);
                          }}
                          title="Sửa"
                          className={styles.actionBtn}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setObjectToDelete(item);
                          }}
                          title="Xoá"
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className={`${styles.itemTitle} ${isDone ? styles.itemTitleDone : ''}`}>
                      {item.title}
                    </div>

                    {item.description && (
                      <p style={{
                        fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0',
                        lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: '8px', borderTop: '1px solid var(--border-subtle)',
                    fontSize: '11px', color: 'var(--text-secondary)',
                  }}>
                    {pLabel ? (
                      <Badge variant={pVariant}>{pLabel}</Badge>
                    ) : (
                      <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                    )}

                    {item.dueDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> {new Date(item.dueDate).toLocaleDateString('vi-VN')}
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
          spaceId={spaceId}
          initialStatus={createModalProps?.initialStatus}
          initialDueDate={createModalProps?.initialDueDate}
          onClose={() => {
            setShowCreateModal(false);
            setCreateModalProps(null);
          }}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['objects'] });
            queryClient.invalidateQueries({ queryKey: ['spaces'] });
            addToast({
              title: 'Thành công',
              description: 'Đã thêm mục mới vào Không gian.',
              variant: 'success',
            });
          }}
        />
      )}

      <SpaceSettingsDialog
        space={space}
        open={settingsOpen}
        saving={updateSpaceMutation.isPending}
        onClose={() => setSettingsOpen(false)}
        onSave={payload =>
          updateSpaceMutation.mutate(
            { id: space.id, payload },
            {
              onSuccess: () => {
                setSettingsOpen(false);
                addToast({ title: 'Thành công', description: 'Đã lưu cài đặt Không gian.', variant: 'success' });
              },
              onError: () => addToast({ title: 'Lỗi', description: 'Không lưu được cài đặt.', variant: 'danger' }),
            },
          )
        }
      />

      {/* Confirm Delete Space Dialog */}
      <ConfirmDialog
        open={confirmDeleteSpace}
        title="Xoá Không gian?"
        description={`Bạn có chắc muốn xoá Không gian "${space.name}"? Các mục thuộc Không gian này sẽ không bị xoá mà chuyển về Hộp nhận chung.`}
        confirmLabel="Xoá Không gian"
        variant="danger"
        onConfirm={handleDeleteSpaceConfirm}
        onCancel={() => setConfirmDeleteSpace(false)}
      />

      {/* Confirm Delete Object Dialog */}
      <ConfirmDialog
        open={Boolean(objectToDelete)}
        title="Xoá mục này?"
        description={`Bạn có chắc muốn chuyển "${objectToDelete?.title}" vào Thùng rác? Bạn có thể hoàn tác hoặc khôi phục từ Thùng rác.`}
        confirmLabel="Chuyển vào Thùng rác"
        variant="danger"
        onConfirm={handleConfirmDeleteObject}
        onCancel={() => setObjectToDelete(null)}
      />

      {/* Object Detail Drawer */}
      {selectedDrawerObjectId && (
        <ObjectDetailDrawer
          objectId={selectedDrawerObjectId}
          onClose={() => setSelectedDrawerObjectId(null)}
          onSelectObject={id => setSelectedDrawerObjectId(id)}
        />
      )}
    </div>
  );
}