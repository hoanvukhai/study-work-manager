'use client';

import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FolderGit2, 
  Kanban, 
  Calendar, 
  Inbox, 
  Trash2, 
  Plus, 
  GraduationCap, 
  Briefcase 
} from 'lucide-react';

export default function Sidebar() {
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      backgroundColor: 'var(--surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Brand Logo */}
      <div style={{
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'var(--primary-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '16px',
        }}>
          S
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
            Study & Work
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Personal Workspace
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        {/* Core Nav */}
        <div style={{ marginBottom: '24px' }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--tag-task-bg)',
            color: 'var(--tag-task-text)',
            fontWeight: 500,
            fontSize: '14px',
            marginBottom: '4px',
          }}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link href="/unassigned" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            fontWeight: 500,
            fontSize: '14px',
          }}>
            <Inbox size={18} />
            Hộp nhận (Inbox)
          </Link>
        </div>

        {/* Spaces Tree */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px 8px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-secondary)',
          }}>
            <span>Không gian (Spaces)</span>
            <button style={{ color: 'var(--text-secondary)', background: 'transparent' }}>
              <Plus size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <Link href="/spaces/thesis" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              color: 'var(--text-primary)',
            }}>
              <GraduationCap size={16} color="#1a73e8" />
              <span>Đồ án tốt nghiệp</span>
            </Link>
            <Link href="/spaces/freelance" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              color: 'var(--text-primary)',
            }}>
              <Briefcase size={16} color="#f59e0b" />
              <span>Việc Freelance</span>
            </Link>
          </div>
        </div>

        {/* Views */}
        <div>
          <div style={{
            padding: '0 12px 8px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-secondary)',
          }}>
            Góc nhìn (Views)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <Link href="/views/kanban" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              color: 'var(--text-secondary)',
            }}>
              <Kanban size={16} />
              <span>Bảng việc Kanban</span>
            </Link>
            <Link href="/views/calendar" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              color: 'var(--text-secondary)',
            }}>
              <Calendar size={16} />
              <span>Lịch biểu</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Nav */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <Link href="/trash" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          color: 'var(--text-secondary)',
        }}>
          <Trash2 size={16} />
          <span>Thùng rác</span>
        </Link>
      </div>
    </aside>
  );
}
