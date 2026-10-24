'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Trash2,
  Plus,
  KanbanSquare,
  Calendar,
  BookOpenCheck,
  MoreVertical,
  Archive,
  Inbox,
  X,
  Layers,
} from 'lucide-react';
import { useSpaces, useDeleteSpace, useUpdateSpace } from '@/hooks/useSpaces';
import { useLayout } from '@/lib/layout-context';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import CreateSpaceModal from '../spaces/CreateSpaceModal';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useLayout();
  const toast = useToast();

  const { data: spaces = [], isLoading } = useSpaces();
  const deleteSpaceMutation = useDeleteSpace();
  const updateSpaceMutation = useUpdateSpace();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    spaceId: string;
    spaceName: string;
    x: number;
    y: number;
  } | null>(null);

  // Dialog xác nhận xóa Space (thay window.confirm)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    spaceId: string;
    spaceName: string;
  }>({
    isOpen: false,
    spaceId: '',
    spaceName: '',
  });

  // Tự đóng drawer mobile khi chuyển trang
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // Đóng context menu khi click ra ngoài
  useEffect(() => {
    if (contextMenu) {
      const close = () => setContextMenu(null);
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [contextMenu]);

  const handleArchive = async (spaceId: string, spaceName: string) => {
    setContextMenu(null);
    try {
      await updateSpaceMutation.mutateAsync({
        id: spaceId,
        payload: { isArchived: true },
      });
      toast.success(`Đã chuyển Không gian "${spaceName}" vào Lưu trữ`, {
        undoText: 'Hoàn tác',
        onUndo: async () => {
          await updateSpaceMutation.mutateAsync({
            id: spaceId,
            payload: { isArchived: false },
          });
          toast.info(`Đã khôi phục Không gian "${spaceName}"`);
        },
      });
      if (pathname === `/spaces/${spaceId}`) {
        router.push('/');
      }
    } catch {
      toast.error('Không thể lưu trữ Không gian');
    }
  };

  const confirmDeleteSpace = async () => {
    const { spaceId, spaceName } = deleteDialog;
    setDeleteDialog({ isOpen: false, spaceId: '', spaceName: '' });

    try {
      await deleteSpaceMutation.mutateAsync(spaceId);
      toast.success(`Đã xoá Không gian "${spaceName}". Các mục bên trong vẫn được giữ lại.`);
      if (pathname === `/spaces/${spaceId}`) {
        router.push('/');
      }
    } catch {
      toast.error('Không thể xoá Không gian');
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Backdrop cho mobile drawer */}
      {sidebarOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link href="/" className={styles.brandLink}>
            <div className={styles.logoIcon}>SW</div>
            <span className={styles.brandName}>Study & Work</span>
          </Link>
          <button
            className={styles.closeMobileBtn}
            onClick={() => setSidebarOpen(false)}
            aria-label="Đóng thanh điều hướng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation items */}
        <div className={styles.navContainer}>
          {/* Main Views */}
          <div className={styles.navSection}>
            <Link
              href="/"
              className={`${styles.navLink} ${isActive('/') ? styles.navLinkActive : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Tổng quan</span>
            </Link>

            <Link
              href="/kanban"
              className={`${styles.navLink} ${isActive('/kanban') ? styles.navLinkActive : ''}`}
            >
              <KanbanSquare size={18} />
              <span>Bảng Kanban</span>
            </Link>

            <Link
              href="/calendar"
              className={`${styles.navLink} ${isActive('/calendar') ? styles.navLinkActive : ''}`}
            >
              <Calendar size={18} />
              <span>Lịch trình</span>
            </Link>

            <Link
              href="/study"
              className={`${styles.navLink} ${isActive('/study') ? styles.navLinkActive : ''}`}
            >
              <BookOpenCheck size={18} />
              <span>Học tập</span>
            </Link>
          </div>

          {/* Spaces List */}
          <div className={styles.navSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Không gian</span>
              <button
                className={styles.addBtn}
                onClick={() => setShowCreateModal(true)}
                title="Tạo Không gian mới"
                aria-label="Tạo Không gian mới"
              >
                <Plus size={14} />
              </button>
            </div>

            {isLoading && (
              <div style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Đang tải...
              </div>
            )}

            {!isLoading && spaces.length === 0 && (
              <div style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Chưa có không gian nào
              </div>
            )}

            {spaces.map((space) => {
              const active = pathname === `/spaces/${space.id}`;
              return (
                <div
                  key={space.id}
                  className={`${styles.spaceItem} ${active ? styles.spaceItemActive : ''}`}
                  onClick={() => router.push(`/spaces/${space.id}`)}
                >
                  <div className={styles.spaceInfo}>
                    <span className={styles.spaceIcon}>{space.icon || '📁'}</span>
                    <span className={styles.spaceName}>{space.name}</span>
                  </div>

                  {space._count?.spaceObjects !== undefined && space._count.spaceObjects > 0 && (
                    <span className={styles.spaceCount}>{space._count.spaceObjects}</span>
                  )}

                  <button
                    className={styles.moreBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setContextMenu({
                        spaceId: space.id,
                        spaceName: space.name,
                        x: rect.right + 6,
                        y: rect.top,
                      });
                    }}
                    aria-label={`Tùy chọn ${space.name}`}
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick links: Inbox, Archive, Trash */}
          <div className={styles.navSection} style={{ marginTop: 'auto' }}>
            <span className={styles.sectionTitle} style={{ padding: '4px 8px', marginBottom: '4px' }}>
              Kho dữ liệu
            </span>

            <Link
              href="/inbox"
              className={`${styles.navLink} ${isActive('/inbox') || isActive('/unassigned') ? styles.navLinkActive : ''}`}
            >
              <Inbox size={18} />
              <span>Hộp nhận</span>
            </Link>

            <Link
              href="/archive"
              className={`${styles.navLink} ${isActive('/archive') ? styles.navLinkActive : ''}`}
            >
              <Archive size={18} />
              <span>Kho lưu trữ</span>
            </Link>

            <Link
              href="/trash"
              className={`${styles.navLink} ${isActive('/trash') ? styles.navLinkActive : ''}`}
            >
              <Trash2 size={18} />
              <span>Thùng rác</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span>Study & Work Manager</span>
          <span>v1.0</span>
        </div>
      </aside>

      {/* Context Menu for Space Options */}
      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 180) }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={styles.contextMenuItem}
            onClick={() => handleArchive(contextMenu.spaceId, contextMenu.spaceName)}
          >
            <Archive size={15} />
            <span>Lưu trữ Không gian</span>
          </button>
          <button
            className={`${styles.contextMenuItem} ${styles.dangerItem}`}
            onClick={() => {
              const current = contextMenu;
              setContextMenu(null);
              setDeleteDialog({
                isOpen: true,
                spaceId: current.spaceId,
                spaceName: current.spaceName,
              });
            }}
          >
            <Trash2 size={15} />
            <span>Xoá Không gian</span>
          </button>
        </div>
      )}

      {/* ConfirmDialog thay confirm() của trình duyệt (UI-03, UI-05, QD-04) */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={`Xoá Không gian "${deleteDialog.spaceName}"?`}
        message="Các mục bên trong vẫn được giữ lại an toàn trong hệ thống. Những mục không thuộc Không gian khác sẽ được chuyển về Hộp nhận."
        confirmText="Xoá Không gian"
        cancelText="Giữ lại"
        variant="danger"
        loading={deleteSpaceMutation.isPending}
        onConfirm={confirmDeleteSpace}
        onCancel={() => setDeleteDialog({ isOpen: false, spaceId: '', spaceName: '' })}
      />

      {/* Modal tạo Space */}
      {showCreateModal && (
        <CreateSpaceModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newSpace) => {
            setShowCreateModal(false);
            router.push(`/spaces/${newSpace.id}`);
          }}
        />
      )}
    </>
  );
}
