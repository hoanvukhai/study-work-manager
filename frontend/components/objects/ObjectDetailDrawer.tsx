'use client';

import React, { useState, useEffect, useRef } from 'react';
import { isoToLocalInput, localInputToIso } from '@/lib/datetime';
import {
  X,
  CheckSquare,
  FileText,
  Calendar,
  Link2,
  Trash2,
  Archive,
  RotateCcw,
  Plus,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Search,
} from 'lucide-react';
import styles from './ObjectDetailDrawer.module.css';
import {
  AppObject,
  ObjectType,
  TaskStatus,
  Priority,
  UpdateObjectPayload,
} from '@/lib/objects-api';
import {
  useObject,
  useUpdateObject,
  useUpdateObjectLifecycle,
  useConvertObjectType,
  useDeleteObject,
  useAttachObjectToSpace,
  useRemoveObjectFromSpace,
  useObjects,
} from '@/hooks/useObjects';
import { useSpaces } from '@/hooks/useSpaces';
import {
  useObjectRelations,
  useCreateRelation,
  useDeleteRelation,
} from '@/hooks/useRelations';
import { RelationType, RELATION_LABELS } from '@/lib/relations-api';
import NoteCards from '@/components/study/NoteCards';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';

interface Props {
  objectId: string | null;
  onClose: () => void;
  onSelectObject?: (id: string) => void;
}

const TYPE_CONFIG: Record<
  ObjectType,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  TASK: {
    label: 'Công việc',
    icon: <CheckSquare size={16} />,
    color: 'var(--tag-task-text)',
    bg: 'var(--tag-task-bg)',
  },
  NOTE: {
    label: 'Ghi chú',
    icon: <FileText size={16} />,
    color: 'var(--tag-note-text)',
    bg: 'var(--tag-note-bg)',
  },
  EVENT: {
    label: 'Sự kiện',
    icon: <Calendar size={16} />,
    color: 'var(--tag-event-text)',
    bg: 'var(--tag-event-bg)',
  },
  REFERENCE: {
    label: 'Tham khảo',
    icon: <Link2 size={16} />,
    color: 'var(--tag-ref-text)',
    bg: 'var(--tag-ref-bg)',
  },
};

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Thấp' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HIGH', label: 'Cao' },
  { value: 'URGENT', label: 'Khẩn cấp' },
];

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'Cần làm' },
  { value: 'IN_PROGRESS', label: 'Đang làm' },
  { value: 'DONE', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

export default function ObjectDetailDrawer({
  objectId,
  onClose,
  onSelectObject,
}: Props) {
  const { data: object, isLoading } = useObject(objectId || '');
  const { data: spaces = [] } = useSpaces();
  const { data: relations } = useObjectRelations(objectId || '');
  const { data: allObjects = [] } = useObjects({ lifecycle: 'ACTIVE' });

  const updateObjectMutation = useUpdateObject();
  const updateLifecycleMutation = useUpdateObjectLifecycle();
  const convertTypeMutation = useConvertObjectType();
  const deleteObjectMutation = useDeleteObject();
  const attachSpaceMutation = useAttachObjectToSpace();
  const removeSpaceMutation = useRemoveObjectFromSpace();
  const createRelationMutation = useCreateRelation();
  const deleteRelationMutation = useDeleteRelation(objectId || undefined);

  const toast = useToast();

  // Local form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [url, setUrl] = useState('');
  const [estimated, setEstimated] = useState('');
  const [confirmDoneBlocked, setConfirmDoneBlocked] = useState(false);

  // UI state
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showSpaceMenu, setShowSpaceMenu] = useState(false);
  const [showAddRelation, setShowAddRelation] = useState(false);
  const [relationTargetId, setRelationTargetId] = useState('');
  const [relationType, setRelationType] = useState<RelationType>('RELATES_TO');
  const [relationSearch, setRelationSearch] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Sync state when object loads or changes
  useEffect(() => {
    if (object) {
      setTitle(object.title || '');
      setDescription(object.description || '');
      setStatus(object.status || 'TODO');
      setPriority(object.priority || 'MEDIUM');
      setDueDate(isoToLocalInput(object.dueDate));
      setStartAt(isoToLocalInput(object.startAt));
      setEndAt(isoToLocalInput(object.endAt));
      setUrl(object.url || '');
      setEstimated(object.estimatedMinutes ? String(object.estimatedMinutes) : '');
      setIsDirty(false);
    }
  }, [object]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showTypeMenu) setShowTypeMenu(false);
        else if (showSpaceMenu) setShowSpaceMenu(false);
        else if (showAddRelation) setShowAddRelation(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTypeMenu, showSpaceMenu, showAddRelation, onClose]);

  if (!objectId) return null;

  const handleSave = async () => {
    if (!object || !title.trim()) return;

    try {
      const payload: UpdateObjectPayload = {
        title: title.trim(),
        description: description.trim() || null,
        ...(object.type === 'TASK' && {
          status,
          priority,
          dueDate: localInputToIso(dueDate),
          estimatedMinutes: estimated ? Math.max(1, Math.round(Number(estimated))) : null,
        }),
        ...(object.type === 'EVENT' && {
          priority,
          startAt: localInputToIso(startAt),
          endAt: localInputToIso(endAt),
        }),
        ...(object.type === 'REFERENCE' && {
          url: url.trim() || null,
        }),
      };

      await updateObjectMutation.mutateAsync({ id: object.id, payload });
      setIsDirty(false);
      toast.success('Đã lưu thay đổi');
    } catch {
      toast.error('Có lỗi xảy ra khi lưu thay đổi');
    }
  };

  const handleConvertType = async (targetType: ObjectType) => {
    if (!object || object.type === targetType) {
      setShowTypeMenu(false);
      return;
    }

    try {
      await convertTypeMutation.mutateAsync({ id: object.id, targetType });
      setShowTypeMenu(false);
      toast.success(`Đã chuyển thành ${TYPE_CONFIG[targetType].label}`);
    } catch {
      toast.error('Không thể chuyển đổi loại đối tượng');
    }
  };

  const handleArchive = async () => {
    if (!object) return;
    try {
      await updateLifecycleMutation.mutateAsync({
        id: object.id,
        action: 'ARCHIVE',
      });
      toast.success('Đã lưu trữ mục', {
        action: {
          label: 'Hoàn tác',
          onClick: () =>
            updateLifecycleMutation.mutate({ id: object.id, action: 'RESTORE' }),
        },
      });
      onClose();
    } catch {
      toast.error('Không thể lưu trữ mục');
    }
  };

  const handleTrash = async () => {
    if (!object) return;
    try {
      await updateLifecycleMutation.mutateAsync({
        id: object.id,
        action: 'TRASH',
      });
      toast.success('Đã chuyển vào Thùng rác', {
        action: {
          label: 'Hoàn tác',
          onClick: () =>
            updateLifecycleMutation.mutate({ id: object.id, action: 'RESTORE' }),
        },
      });
      onClose();
    } catch {
      toast.error('Không thể chuyển vào thùng rác');
    }
  };

  const handleRestore = async () => {
    if (!object) return;
    try {
      await updateLifecycleMutation.mutateAsync({
        id: object.id,
        action: 'RESTORE',
      });
      toast.success('Đã khôi phục thành công');
    } catch {
      toast.error('Không thể khôi phục mục');
    }
  };

  const handleDeletePermanent = async () => {
    if (!object) return;
    try {
      await deleteObjectMutation.mutateAsync(object.id);
      setShowDeleteConfirm(false);
      toast.success('Đã xoá vĩnh viễn đối tượng');
      onClose();
    } catch {
      toast.error('Không thể xoá đối tượng');
    }
  };

  const handleAttachSpace = async (spaceId: string) => {
    if (!object) return;
    try {
      await attachSpaceMutation.mutateAsync({ objectId: object.id, spaceId });
      setShowSpaceMenu(false);
      toast.success('Đã gán vào Không gian');
    } catch {
      toast.error('Không thể gán vào Không gian');
    }
  };

  const handleRemoveSpace = async (spaceId: string) => {
    if (!object) return;
    try {
      await removeSpaceMutation.mutateAsync({ objectId: object.id, spaceId });
      toast.success('Đã gỡ khỏi Không gian');
    } catch {
      toast.error('Không thể gỡ khỏi Không gian');
    }
  };

  const handleCreateRelation = async () => {
    if (!object || !relationTargetId) return;
    try {
      await createRelationMutation.mutateAsync({
        fromObjectId: object.id,
        toObjectId: relationTargetId,
        relationType,
      });
      setShowAddRelation(false);
      setRelationTargetId('');
      toast.success('Đã tạo liên kết thành công');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể tạo liên kết');
    }
  };

  const handleDeleteRelation = async (relationId: string) => {
    try {
      await deleteRelationMutation.mutateAsync(relationId);
      toast.success('Đã xoá liên kết');
    } catch {
      toast.error('Không thể xoá liên kết');
    }
  };

  // Trụ Kế hoạch: việc tiền đề chưa xong, việc con, việc cha
  const isOpen = (st?: string | null) => st !== 'DONE' && st !== 'CANCELLED';
  const blockers = (relations?.outgoing ?? []).filter(
    (r) => r.relationType === 'DEPENDS_ON' && r.toObject && isOpen(r.toObject.status),
  );
  const waitingOnMe = (relations?.incoming ?? []).filter(
    (r) => r.relationType === 'DEPENDS_ON' && r.fromObject && isOpen(r.fromObject.status),
  );
  const children = (relations?.outgoing ?? []).filter((r) => r.relationType === 'PARENT_OF' && r.toObject);
  const parent = (relations?.incoming ?? []).find((r) => r.relationType === 'PARENT_OF' && r.fromObject);
  const childrenDone = children.filter((r) => r.toObject!.status === 'DONE').length;
  const childrenTotal = children.filter((r) => r.toObject!.status !== 'CANCELLED').length;

  // Spaces assigned
  const assignedSpaceIds = new Set(
    object?.spaceObjects?.map((so) => so.spaceId) || [],
  );
  const availableSpaces = spaces.filter((s) => !assignedSpaceIds.has(s.id));

  // Eligible targets for relations (active, not self)
  const candidateObjects = allObjects.filter(
    (o) =>
      o.id !== objectId &&
      (!relationSearch ||
        o.title.toLowerCase().includes(relationSearch.toLowerCase())),
  );

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer} ref={drawerRef}>
        {/* Banner if TRASH or ARCHIVE */}
        {object?.lifecycle === 'TRASH' && (
          <div className={`${styles.lifecycleBanner} ${styles.bannerTrash}`}>
            <span>Mục này đang ở trong Thùng rác</span>
            <Button size="sm" variant="outline" onClick={handleRestore}>
              Khôi phục
            </Button>
          </div>
        )}
        {object?.lifecycle === 'ARCHIVED' && (
          <div className={`${styles.lifecycleBanner} ${styles.bannerArchive}`}>
            <span>Mục này đã được Lưu trữ</span>
            <Button size="sm" variant="outline" onClick={handleRestore}>
              Khôi phục
            </Button>
          </div>
        )}

        {/* Drawer Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {object && (
              <button
                className={styles.typeBadgeBtn}
                style={{
                  color: TYPE_CONFIG[object.type].color,
                  backgroundColor: TYPE_CONFIG[object.type].bg,
                }}
                onClick={() => setShowTypeMenu(!showTypeMenu)}
                title="Bấm để chuyển đổi loại đối tượng"
              >
                {TYPE_CONFIG[object.type].icon}
                <span>{TYPE_CONFIG[object.type].label}</span>
                <ChevronDown size={14} />
              </button>
            )}

            {/* Type Conversion Dropdown (QD-06) */}
            {showTypeMenu && (
              <div className={styles.typeMenu}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    padding: '4px 8px',
                    textTransform: 'uppercase',
                  }}
                >
                  Chuyển thành...
                </div>
                {(['TASK', 'NOTE', 'EVENT', 'REFERENCE'] as ObjectType[]).map(
                  (t) => (
                    <button
                      key={t}
                      className={styles.typeMenuItem}
                      onClick={() => handleConvertType(t)}
                    >
                      {TYPE_CONFIG[t].icon}
                      <span>{TYPE_CONFIG[t].label}</span>
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          <div className={styles.headerRight}>
            {object?.lifecycle === 'ACTIVE' && (
              <>
                <button
                  className={styles.iconBtn}
                  onClick={handleArchive}
                  title="Lưu trữ mục này"
                >
                  <Archive size={18} />
                </button>
                <button
                  className={styles.iconBtn}
                  onClick={handleTrash}
                  title="Chuyển vào thùng rác"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
            {object?.lifecycle === 'TRASH' && (
              <button
                className={styles.iconBtn}
                onClick={() => setShowDeleteConfirm(true)}
                title="Xoá vĩnh viễn"
                style={{ color: 'var(--danger)' }}
              >
                <Trash2 size={18} />
              </button>
            )}
            <button className={styles.iconBtn} onClick={onClose} title="Đóng (Esc)">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        {isLoading || !object ? (
          <div style={{ padding: 24, color: 'var(--text-muted)' }}>
            Đang tải thông tin chi tiết...
          </div>
        ) : (
          <div className={styles.body}>
            {/* Title */}
            <div>
              <input
                className={styles.titleInput}
                value={title}
                placeholder="Tiêu đề..."
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsDirty(true);
                }}
              />
            </div>

            {/* Spaces section (Chips - Cốt lõi) */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Không gian gắn kết</span>
              </div>
              <div className={styles.chipsContainer}>
                {object.spaceObjects && object.spaceObjects.length > 0 ? (
                  object.spaceObjects.map((so) => (
                    <span key={so.id} className={styles.spaceChip}>
                      <span>{so.space.icon || '📁'}</span>
                      <span>{so.space.name}</span>
                      <button
                        className={styles.spaceChipRemove}
                        onClick={() => handleRemoveSpace(so.spaceId)}
                        title="Gỡ khỏi Không gian"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className={styles.emptySpaceNote}>
                    Chưa phân loại (Hộp nhận)
                  </span>
                )}

                {/* Add to space dropdown */}
                {availableSpaces.length > 0 && (
                  <div className={styles.addSpaceWrapper}>
                    <button
                      className={styles.addSpaceBtn}
                      onClick={() => setShowSpaceMenu(!showSpaceMenu)}
                    >
                      <Plus size={14} /> Thêm Không gian
                    </button>
                    {showSpaceMenu && (
                      <div className={styles.spaceDropdown}>
                        {availableSpaces.map((s) => (
                          <button
                            key={s.id}
                            className={styles.spaceDropdownItem}
                            onClick={() => handleAttachSpace(s.id)}
                          >
                            <span>{s.icon || '📁'}</span>
                            <span>{s.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Properties Grid based on Object Type */}
            <div className={styles.propsGrid}>
              {object.type === 'TASK' && (
                <>
                  <div className={styles.propItem}>
                    <label className={styles.propLabel}>Trạng thái</label>
                    <select
                      className={styles.propInput}
                      value={status}
                      onChange={(e) => {
                        const next = e.target.value as TaskStatus;
                        if (next === 'DONE' && blockers.length > 0) {
                          setConfirmDoneBlocked(true);
                          return;
                        }
                        setStatus(next);
                        setIsDirty(true);
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.propItem}>
                    <label className={styles.propLabel}>Độ ưu tiên</label>
                    <select
                      className={styles.propInput}
                      value={priority}
                      onChange={(e) => {
                        setPriority(e.target.value as Priority);
                        setIsDirty(true);
                      }}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.propItem} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.propLabel}>Hạn chót</label>
                    <input
                      type="datetime-local"
                      className={styles.propInput}
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value);
                        setIsDirty(true);
                      }}
                    />
                  </div>
                  <div className={styles.propItem} style={{ gridColumn: 'span 2' }}>
                    <label className={styles.propLabel}>Ước lượng thời gian (phút)</label>
                    <input
                      type="number"
                      min={1}
                      max={10080}
                      step={5}
                      className={styles.propInput}
                      placeholder="VD: 90"
                      value={estimated}
                      onChange={(e) => {
                        setEstimated(e.target.value);
                        setIsDirty(true);
                      }}
                    />
                  </div>
                </>
              )}

              {object.type === 'EVENT' && (
                <>
                  <div className={styles.propItem}>
                    <label className={styles.propLabel}>Bắt đầu</label>
                    <input
                      type="datetime-local"
                      className={styles.propInput}
                      value={startAt}
                      onChange={(e) => {
                        setStartAt(e.target.value);
                        setIsDirty(true);
                      }}
                    />
                  </div>
                  <div className={styles.propItem}>
                    <label className={styles.propLabel}>Kết thúc</label>
                    <input
                      type="datetime-local"
                      className={styles.propInput}
                      value={endAt}
                      onChange={(e) => {
                        setEndAt(e.target.value);
                        setIsDirty(true);
                      }}
                    />
                  </div>
                  <div className={styles.propItem}>
                    <label className={styles.propLabel}>Độ ưu tiên</label>
                    <select
                      className={styles.propInput}
                      value={priority}
                      onChange={(e) => {
                        setPriority(e.target.value as Priority);
                        setIsDirty(true);
                      }}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {object.type === 'REFERENCE' && (
                <div className={styles.propItem} style={{ gridColumn: 'span 2' }}>
                  <label className={styles.propLabel}>Đường dẫn URL</label>
                  <input
                    type="url"
                    className={styles.propInput}
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setIsDirty(true);
                    }}
                  />
                  {url && (
                    <div className={styles.urlPreview}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.urlLink}
                      >
                        <ExternalLink size={12} />
                        Mở liên kết ({(() => {
                          try {
                            return new URL(url).hostname;
                          } catch {
                            return url;
                          }
                        })()})
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description / Content */}
            {object.type === 'TASK' && (blockers.length > 0 || waitingOnMe.length > 0 || children.length > 0 || parent) && (
              <div className={styles.section}>
                <span className={styles.sectionTitle}>Kế hoạch</span>
                {blockers.length > 0 && (
                  <div className={styles.blockedBanner}>
                    🔒 Đang chờ {blockers.length} việc hoàn thành trước:{' '}
                    {blockers.map((r, i) => (
                      <React.Fragment key={r.id}>
                        {i > 0 && ', '}
                        <button type="button" className={styles.linkBtn} onClick={() => onSelectObject && onSelectObject(r.toObjectId)}>
                          {r.toObject!.title}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                )}
                {waitingOnMe.length > 0 && (
                  <div className={styles.planNote}>
                    Hoàn thành việc này sẽ mở khoá {waitingOnMe.length} việc khác:{' '}
                    {waitingOnMe.map((r) => r.fromObject!.title).join(', ')}
                  </div>
                )}
                {parent && (
                  <div className={styles.planNote}>
                    Là việc con của{' '}
                    <button type="button" className={styles.linkBtn} onClick={() => onSelectObject && onSelectObject(parent.fromObjectId)}>
                      {parent.fromObject!.title}
                    </button>
                  </div>
                )}
                {children.length > 0 && (
                  <div className={styles.childBox}>
                    <div className={styles.childHeader}>
                      <span>Việc con</span>
                      <span>
                        {childrenDone}/{childrenTotal} xong
                      </span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{ width: childrenTotal ? `${Math.round((childrenDone / childrenTotal) * 100)}%` : '0%' }}
                      />
                    </div>
                    {children.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className={styles.childItem}
                        onClick={() => onSelectObject && onSelectObject(r.toObjectId)}
                      >
                        <span>{r.toObject!.status === 'DONE' ? '✅' : r.toObject!.status === 'CANCELLED' ? '⛔' : '⬜'}</span>
                        <span>{r.toObject!.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className={styles.section}>
              <span className={styles.sectionTitle}>Nội dung / Ghi chú</span>
              <textarea
                className={styles.textarea}
                placeholder="Nhập ghi chú hoặc mô tả chi tiết..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setIsDirty(true);
                }}
              />
            </div>

            {object.type === 'NOTE' && (
              <div className={styles.section}>
                <span className={styles.sectionTitle}>Thẻ ôn tập</span>
                <NoteCards noteId={object.id} dirty={isDirty} />
              </div>
            )}

            {/* 2-Way Cross-Linking Section (BUG-11, BUG-15) */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Liên kết liên quan</span>
                <button
                  className={styles.addSpaceBtn}
                  onClick={() => setShowAddRelation(!showAddRelation)}
                >
                  <Plus size={14} /> Thêm liên kết
                </button>
              </div>

              {/* Add Relation Box */}
              {showAddRelation && (
                <div className={styles.addRelationBox}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select
                      className={styles.propInput}
                      value={relationType}
                      onChange={(e) =>
                        setRelationType(e.target.value as RelationType)
                      }
                      style={{ flex: 1 }}
                    >
                      <option value="RELATES_TO">Liên quan đến</option>
                      <option value="DEPENDS_ON">Phụ thuộc vào</option>
                      <option value="REFERENCES">Tham chiếu tài liệu</option>
                      <option value="PARENT_OF">Mục cha của</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <input
                      type="text"
                      className={styles.propInput}
                      placeholder="Tìm đối tượng cần liên kết..."
                      value={relationSearch}
                      onChange={(e) => setRelationSearch(e.target.value)}
                    />
                    <select
                      className={styles.propInput}
                      value={relationTargetId}
                      onChange={(e) => setRelationTargetId(e.target.value)}
                    >
                      <option value="">-- Chọn đối tượng liên kết --</option>
                      {candidateObjects.map((co) => (
                        <option key={co.id} value={co.id}>
                          [{TYPE_CONFIG[co.type].label}] {co.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddRelation(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={!relationTargetId}
                      onClick={handleCreateRelation}
                    >
                      Tạo liên kết
                    </Button>
                  </div>
                </div>
              )}

              {/* Relations List */}
              <div className={styles.relationsList}>
                {/* Outgoing */}
                {relations?.outgoing?.map((rel) => (
                  <div key={rel.id} className={styles.relationItem}>
                    <div className={styles.relationMeta}>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                      <span className={styles.relationTypeBadge}>
                        {RELATION_LABELS[rel.relationType] || rel.relationType}
                      </span>
                      <span
                        className={styles.relationTitle}
                        onClick={() => {
                          if (onSelectObject && rel.toObjectId) {
                            onSelectObject(rel.toObjectId);
                          }
                        }}
                        title="Bấm để mở chi tiết đối tượng này"
                      >
                        {rel.toObject?.title || 'Đối tượng liên kết'}
                      </span>
                    </div>
                    <button
                      className={styles.spaceChipRemove}
                      onClick={() => handleDeleteRelation(rel.id)}
                      title="Xoá liên kết"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {/* Incoming */}
                {relations?.incoming?.map((rel) => (
                  <div key={rel.id} className={styles.relationItem}>
                    <div className={styles.relationMeta}>
                      <ArrowLeft size={14} style={{ color: 'var(--text-muted)' }} />
                      <span className={styles.relationTypeBadge}>
                        Được liên kết bởi
                      </span>
                      <span
                        className={styles.relationTitle}
                        onClick={() => {
                          if (onSelectObject && rel.fromObjectId) {
                            onSelectObject(rel.fromObjectId);
                          }
                        }}
                        title="Bấm để mở chi tiết đối tượng này"
                      >
                        {rel.fromObject?.title || 'Đối tượng nguồn'}
                      </span>
                    </div>
                    <button
                      className={styles.spaceChipRemove}
                      onClick={() => handleDeleteRelation(rel.id)}
                      title="Xoá liên kết"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {(!relations?.outgoing || relations.outgoing.length === 0) &&
                  (!relations?.incoming || relations.incoming.length === 0) && (
                    <span className={styles.emptySpaceNote}>
                      Chưa có liên kết nào
                    </span>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Drawer Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {isDirty ? (
              <span style={{ color: 'var(--warning)' }}>● Chưa lưu thay đổi</span>
            ) : (
              <span style={{ color: 'var(--success)' }}>
                ● Đã cập nhật
              </span>
            )}
          </div>
          <div className={styles.footerRight}>
            <Button variant="outline" size="sm" onClick={onClose}>
              Đóng
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!isDirty || !title.trim()}
              onClick={handleSave}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Permanent Confirmation */}
      <ConfirmDialog
        open={confirmDoneBlocked}
        title="Việc này đang bị chặn"
        description={`Việc này còn chờ: ${blockers.map((r) => r.toObject!.title).join(', ')}. Vẫn đánh dấu là đã xong?`}
        confirmLabel="Vẫn đánh dấu xong"
        onConfirm={() => {
          setStatus('DONE');
          setIsDirty(true);
          setConfirmDoneBlocked(false);
        }}
        onCancel={() => setConfirmDoneBlocked(false)}
      />
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Xoá vĩnh viễn"
        message="Hành động này sẽ xoá hoàn toàn đối tượng cùng các liên kết khỏi hệ thống và không thể khôi phục. Bạn có chắc chắn muốn xoá?"
        confirmLabel="Xoá vĩnh viễn"
        cancelLabel="Hủy"
        variant="danger"
        onConfirm={handleDeletePermanent}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
