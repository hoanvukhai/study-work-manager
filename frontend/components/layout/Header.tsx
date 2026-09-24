'use client';

import React from 'react';
import { Search, Bell, Plus } from 'lucide-react';

export default function Header() {
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
        <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }}>
          <Plus size={16} />
          <span>Tạo mới (C)</span>
        </button>

        <button style={{
          position: 'relative',
          background: 'transparent',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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

        {/* User Avatar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingLeft: '8px',
          borderLeft: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#e8f0fe',
            color: '#1967d2',
            fontWeight: 600,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            H
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Vũ Khải Hoàn
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              hoan@example.com
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
