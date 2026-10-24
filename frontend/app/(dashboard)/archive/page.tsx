'use client';

import React, { useState } from 'react';
import {
  Archive as ArchiveIcon,
  RotateCcw,
  CheckSquare,
  FileText,
  Calendar,
  Link2,
  Folder,
} from 'lucide-react';
import styles from './Archive.module.css';
import { useObjects, useUpdateObjectLifecycle } from '@/hooks/useObjects';
import { useSpaces, useUpdateSpace } from '@/hooks/useSpaces';
import { ObjectType } from '@/lib/objects-api';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import ObjectDetailDrawer from '@/components/objects/ObjectDetailDrawer';

const TYPE_CONFIG: Record<
  ObjectType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  TASK: {
    label: 'Công việc',
    icon: <CheckSquare size={16} />,
    color: 'var(--tag-task-text)',
  },
  NOTE: {
    label: 'Ghi chú',
    icon: <FileText size={16} />,
    color: 'var(--tag-note-text)',
  },
  EVENT: {
    label: 'Sự kiện',
    icon: <Calendar size={16} />,
    color: 'var(--tag-event-text)',
  },
  REFERENCE: {
    label: 'Tham khảo',
    icon: <Link2 size={16} />,
    color: 'var(--tag-ref-text)',
  },
};

export default function ArchivePage() {
  const [tab, setTab] = useState<'objects' | 'spaces'>('objects');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const { data: objects = [], isLoading: loadingObjects } = useObjects({
    lifecycle: 'ARCHIVED',
  });
  const { data: allSpaces = [], isLoading: loadingSpaces } = useSpaces(true);
  const archivedSpaces = allSpaces.filter((s) => s.archivedAt != null);

  const updateLifecycleMutation = useUpdateObjectLifecycle();
  const updateSpaceMutation = useUpdateSpace();
  const toast = useToast();

  const handleRestoreObject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await updateLifecycleMutation.mutateAsync({ id, action: 'RESTORE' });
      toast.success('Đã khôi phục mục về trạng thái hoạt động');
    } catch {
      toast.error('Không thể khôi phục mục');
    }
  };

  const handleRestoreSpace = async (spaceId: string, spaceName: string) => {
    try {
      await updateSpaceMutation.mutateAsync({
        id: spaceId,
        payload: { isArchived: false },
      });
      toast.success(`Đã khôi phục Không gian "${spaceName}"`);
    } catch {
      toast.error('Không thể khôi phục Không gian');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            <ArchiveIcon size={24} style={{ color: 'var(--warning)' }} />
            Kho Lưu trữ
          </h1>
          <p className={styles.subtitle}>
            Nơi cất giữ các công việc đã hoàn tất hoặc không gian đã đóng lại mà vẫn cần giữ lại để tra cứu.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabList}>
        <button
          className={`${styles.tabBtn} ${tab === 'objects' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('objects')}
        >
          Đối tượng & Ghi chú ({objects.length})
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'spaces' ? styles.tabBtnActive : ''}`}
          onClick={() => setTab('spaces')}
        >
          Không gian ({archivedSpaces.length})
        </button>
      </div>

      {/* Tab: Objects */}
      {tab === 'objects' && (
        <>
          {loadingObjects ? (
            <div className={styles.list}>
              <Skeleton height="56px" />
              <Skeleton height="56px" />
            </div>
          ) : objects.length === 0 ? (
            <EmptyState
              icon={<ArchiveIcon size={36} />}
              title="Không có đối tượng nào được lưu trữ"
              description="Các đối tượng hoặc ghi chú được chọn lưu trữ sẽ xuất hiện ở đây."
            />
          ) : (
            <div className={styles.list}>
              {objects.map((obj) => (
                <div
                  key={obj.id}
                  className={styles.itemCard}
                  onClick={() => setSelectedObjectId(obj.id)}
                >
                  <div className={styles.itemLeft}>
                    <span style={{ color: TYPE_CONFIG[obj.type].color }}>
                      {TYPE_CONFIG[obj.type].icon}
                    </span>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemTitle}>{obj.title}</span>
                      <div className={styles.itemMeta}>
                        <span>{TYPE_CONFIG[obj.type].label}</span>
                        {obj.archivedAt && (
                          <span>
                            Lưu trữ lúc: {new Date(obj.archivedAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleRestoreObject(e, obj.id)}
                      title="Khôi phục lại hoạt động"
                    >
                      <RotateCcw size={14} /> Khôi phục
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Spaces */}
      {tab === 'spaces' && (
        <>
          {loadingSpaces ? (
            <div className={styles.list}>
              <Skeleton height="56px" />
              <Skeleton height="56px" />
            </div>
          ) : archivedSpaces.length === 0 ? (
            <EmptyState
              icon={<Folder size={36} />}
              title="Không có Không gian nào được lưu trữ"
              description="Các Không gian đã hoàn thành hoặc đóng lại sẽ xuất hiện ở đây."
            />
          ) : (
            <div className={styles.list}>
              {archivedSpaces.map((space) => (
                <div key={space.id} className={styles.itemCard}>
                  <div className={styles.itemLeft}>
                    <span style={{ fontSize: 20 }}>{space.icon || '📁'}</span>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemTitle}>{space.name}</span>
                      <div className={styles.itemMeta}>
                        <span>{space.description || 'Không có mô tả'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestoreSpace(space.id, space.name)}
                    >
                      <RotateCcw size={14} /> Khôi phục Không gian
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Object Detail Drawer */}
      {selectedObjectId && (
        <ObjectDetailDrawer
          objectId={selectedObjectId}
          onClose={() => setSelectedObjectId(null)}
          onSelectObject={(id) => setSelectedObjectId(id)}
        />
      )}
    </div>
  );
}
