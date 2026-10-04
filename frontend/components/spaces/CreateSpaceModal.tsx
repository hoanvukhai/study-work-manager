'use client';

import React, { useState } from 'react';
import { createSpace, CreateSpacePayload } from '../../lib/spaces-api';
import { X, Check } from 'lucide-react';

const PRESET_ICONS = ['📁', '📚', '💼', '🎯', '🚀', '🏠', '🎓', '💡', '📝', '🔬', '🎨', '🌿', '⚡', '🏗️', '🎮', '🔧'];
const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
  '#64748b', '#a855f7', '#f97316', '#84cc16',
];

interface Props {
  onClose: () => void;
  onCreated: (space: any) => void;
}

export default function CreateSpaceModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Vui lòng nhập tên Không gian'); return; }
    setLoading(true);
    setError('');
    try {
      const payload: CreateSpacePayload = { name: name.trim(), description: description.trim() || undefined, icon, color };
      const created = await createSpace(payload);
      onCreated(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể tạo Không gian. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        width: '480px',
        maxWidth: '95vw',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        animation: 'slideIn 0.2s ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Tạo Không gian mới</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Nhóm các công việc và ghi chú liên quan</p>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', padding: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '6px', transition: 'all 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-subtle)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Preview */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '24px', padding: '16px',
            background: 'var(--background)', borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: color + '22', border: `2px solid ${color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', flexShrink: 0,
            }}>{icon}</div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>
                {name || 'Tên Không gian'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
                {description || 'Mô tả (tuỳ chọn)'}
              </div>
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Tên Không gian *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Đồ án tốt nghiệp, Việc Freelance..."
              maxLength={100}
              style={{
                width: '100%', padding: '10px 12px', fontSize: '14px',
                background: 'var(--background)', border: '1px solid var(--border-subtle)',
                borderRadius: '8px', color: 'var(--text-primary)', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = color)}
              onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về Không gian này..."
              rows={2}
              style={{
                width: '100%', padding: '10px 12px', fontSize: '14px',
                background: 'var(--background)', border: '1px solid var(--border-subtle)',
                borderRadius: '8px', color: 'var(--text-primary)', outline: 'none',
                boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = color)}
              onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          </div>

          {/* Icon Picker */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Icon
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PRESET_ICONS.map(ic => (
                <button key={ic} type="button" onClick={() => setIcon(ic)} style={{
                  width: '40px', height: '40px', fontSize: '20px',
                  borderRadius: '8px', border: ic === icon ? `2px solid ${color}` : '2px solid transparent',
                  background: ic === icon ? color + '22' : 'var(--background)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Màu sắc
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PRESET_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)} style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: c, border: c === color ? '3px solid var(--text-primary)' : '3px solid transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: c === color ? '0 0 0 2px var(--surface), 0 0 0 4px ' + c : 'none',
                }}>
                  {c === color && <Check size={14} color="white" />}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              marginBottom: '16px', padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: '13px',
            }}>{error}</div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              padding: '10px 20px', borderRadius: '8px', fontWeight: 500, fontSize: '14px',
              background: 'transparent', border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--background)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Huỷ
            </button>
            <button type="submit" disabled={loading} style={{
              padding: '10px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '14px',
              background: color, border: 'none', color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
            }}>
              {loading ? 'Đang tạo...' : '✨ Tạo Không gian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
