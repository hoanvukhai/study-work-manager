'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import CreateObjectModal from '../objects/CreateObjectModal';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut 'c'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'c' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        setCreateModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lấy chữ cái của Tên gọi chính (từ cuối cùng theo tiếng Việt, ví dụ: "Vũ Khải Hoàn" -> lấy "H")
  const getInitials = (fullName?: string) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(/\s+/);
    const lastWord = parts[parts.length - 1];
    return lastWord ? lastWord.charAt(0).toUpperCase() : 'U';
  };

  const initial = getInitials(user?.fullName);

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      {/* Search Bar (Quick Command) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'var(--canvas-bg)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '6px 12px',
        width: '320px',
        color: 'var(--text-secondary)',
        fontSize: '13px',
      }}>
        <Search size={16} />
        <input 
          type="text" 
          placeholder="Tìm kiếm hoặc gõ lệnh... (Ctrl + K)" 
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            width: '100%',
            fontSize: '13px',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Actions & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn-primary"
          style={{ padding: '6px 14px', fontSize: '13px', cursor: 'pointer' }}
        >
          <Plus size={16} />
          <span>Tạo mới (C)</span>
        </button>

        <button style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <Bell size={20} />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '8px',
            height: '8px',
            backgroundColor: '#ea4335',
            borderRadius: '50%',
          }}></span>
        </button>

        {/* User Profile Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingLeft: '8px',
              borderLeft: '1px solid var(--border-subtle)',
              background: 'transparent',
              borderTop: 'none',
              borderRight: 'none',
              borderBottom: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#e8f0fe',
              color: 'var(--primary-blue, #1a73e8)',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {initial}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user?.fullName || 'Người dùng'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {user?.email || 'user@example.com'}
              </div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '200px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              padding: '6px',
              zIndex: 100,
            }}>
              <div style={{
                padding: '8px 12px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '4px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.fullName}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </div>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: '#d93025',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fce8e6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={15} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {createModalOpen && (
        <CreateObjectModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={(newObj) => {
            if (newObj.spaceObjects && newObj.spaceObjects.length > 0) {
              router.push(`/spaces/${newObj.spaceObjects[0].spaceId}`);
            } else {
              window.location.reload();
            }
          }}
        />
      )}
    </header>
  );
}
