'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, LogOut, Menu, Moon, Sun, Shield, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { useLayout } from '@/lib/layout-context';
import CreateObjectModal from '../objects/CreateObjectModal';
import ObjectDetailDrawer from '../objects/ObjectDetailDrawer';
import CommandPalette from './CommandPalette';
import styles from './Header.module.css';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar } = useLayout();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [drawerObjectId, setDrawerObjectId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Phím tắt: 'C' để tạo nhanh, 'Ctrl+K' để tìm kiếm (UI-10)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K hoặc Cmd + K để mở Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // 'C' để tạo mới (chỉ kích hoạt khi không gõ text và không có modal mở)
      if (
        e.key.toLowerCase() === 'c' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName) &&
        !document.querySelector('[role="dialog"]') &&
        !document.querySelector('[role="alertdialog"]') &&
        !commandPaletteOpen &&
        !drawerObjectId
      ) {
        e.preventDefault();
        setCreateModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, drawerObjectId]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (fullName?: string) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(/\s+/);
    const lastWord = parts[parts.length - 1];
    return lastWord ? lastWord.charAt(0).toUpperCase() : 'U';
  };

  const initial = getInitials(user?.fullName);

  return (
    <header className={styles.header}>
      {/* Nút Hamburger menu trên mobile + Ô tìm kiếm */}
      <div className={styles.leftSection}>
        <button
          className={styles.menuBtn}
          onClick={toggleSidebar}
          aria-label="Mở thanh điều hướng"
        >
          <Menu size={20} />
        </button>

        <div
          className={styles.searchBar}
          onClick={() => setCommandPaletteOpen(true)}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          title="Nhấn để tìm kiếm hoặc dùng phím tắt Ctrl + K"
        >
          <Search size={16} />
          <input
            readOnly
            type="text"
            placeholder="Tìm kiếm hoặc gõ lệnh... (Ctrl + K)"
            className={styles.searchInput}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Hành động: Đổi Theme, Tạo nhanh, Profile */}
      <div className={styles.rightSection}>
        {/* Nút chuyển chế độ Sáng / Tối (UI-09) */}
        <button
          className={styles.iconBtn}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
          aria-label="Đổi giao diện sáng tối"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Nút Tạo nhanh */}
        <button
          onClick={() => setCreateModalOpen(true)}
          className={styles.createBtn}
          title="Tạo mục mới (Phím tắt: C)"
        >
          <Plus size={16} />
          <span className={styles.createText}>Tạo mới</span>
        </button>

        {/* Profile Avatar & Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div
            className={styles.userBtn}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            role="button"
            tabIndex={0}
            aria-label="Menu tài khoản"
          >
            <div className={styles.avatar}>{initial}</div>
          </div>

          {dropdownOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.dropdownHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={styles.dropdownName}>{user?.fullName || 'Người dùng'}</span>
                  {user?.role === 'ADMIN' && (
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--primary-blue-subtle)',
                        color: 'var(--primary-blue)',
                        fontWeight: 600,
                      }}
                    >
                      Admin
                    </span>
                  )}
                </div>
                <div className={styles.dropdownEmail}>{user?.email}</div>
              </div>

              <button
                className={styles.dropdownItem}
                onClick={() => {
                  setDropdownOpen(false);
                  router.push('/profile');
                }}
              >
                <UserIcon size={16} />
                <span>Hồ sơ & Bảo mật</span>
              </button>

              {user?.role === 'ADMIN' && (
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push('/admin');
                  }}
                >
                  <Shield size={16} />
                  <span>Khu vực Quản trị</span>
                </button>
              )}

              <button
                className={styles.dropdownItem}
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span>Giao diện: {theme === 'dark' ? 'Tối' : 'Sáng'}</span>
              </button>

              <button
                className={`${styles.dropdownItem} ${styles.dangerItem}`}
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
              >
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tạo Object */}
      {createModalOpen && (
        <CreateObjectModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={() => setCreateModalOpen(false)}
        />
      )}

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectObject={(id) => setDrawerObjectId(id)}
        onCreateObject={() => setCreateModalOpen(true)}
      />

      {/* Object Detail Drawer */}
      {drawerObjectId && (
        <ObjectDetailDrawer
          objectId={drawerObjectId}
          onClose={() => setDrawerObjectId(null)}
          onSelectObject={(id) => setDrawerObjectId(id)}
        />
      )}
    </header>
  );
}
