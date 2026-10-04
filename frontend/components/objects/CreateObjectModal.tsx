'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckSquare, FileText, Calendar, AlertCircle } from 'lucide-react';
import { createObject, ObjectType, Priority, TaskStatus, AppObject, CreateObjectPayload } from '@/lib/objects-api';
import { getSpaces, Space } from '@/lib/spaces-api';

interface Props {
  initialSpaceId?: string;
  initialType?: ObjectType;
  initialStatus?: TaskStatus;
  initialDueDate?: string;
  onClose: () => void;
  onCreated: (object: AppObject) => void;
}

const PRIORITIES: { value: Priority; label: string; color: string; bg: string }[] = [
  { value: 'LOW', label: 'Thấp', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  { value: 'MEDIUM', label: 'Trung bình', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  { value: 'HIGH', label: 'Cao', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { value: 'URGENT', label: 'Khẩn cấp', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
];

export default function CreateObjectModal({
  initialSpaceId,
  initialType = 'TASK',
  initialStatus,
  initialDueDate = '',
  onClose,
  onCreated,
}: Props) {
  const [type, setType] = useState<ObjectType>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [spaceId, setSpaceId] = useState<string>(initialSpaceId || '');
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSpaces()
      .then(data => setSpaces(data.filter(s => !s.parentId)))
      .catch(() => setSpaces([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload: CreateObjectPayload = {
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        ...(type === 'TASK' && {
          priority,
          status: initialStatus,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        }),
        spaceId: spaceId || undefined,
      };

      const created = await createObject(payload);
      onCreated(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể tạo mới. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        width: '540px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        animation: 'slideIn 0.2s ease-out',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {type === 'TASK' ? 'Tạo Công việc mới' : 'Tạo Ghi chú mới'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Quản lý và theo dõi tiến độ một cách có hệ thống
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', padding: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '6px', transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--border-subtle)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab selection */}
        <div style={{
          display: 'flex', borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--canvas-bg)', padding: '6px 24px', gap: '8px',
        }}>
          <button
            type="button"
            onClick={() => setType('TASK')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              background: type === 'TASK' ? 'var(--surface)' : 'transparent',
              color: type === 'TASK' ? 'var(--primary-blue)' : 'var(--text-secondary)',
              border: type === 'TASK' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <CheckSquare size={16} />
            Công việc (Task)
          </button>

          <button
            type="button"
            onClick={() => setType('NOTE')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              background: type === 'NOTE' ? 'var(--surface)' : 'transparent',
              color: type === 'NOTE' ? 'var(--primary-blue)' : 'var(--text-secondary)',
              border: type === 'NOTE' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <FileText size={16} />
            Ghi chú (Note)
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Tiêu đề {type === 'TASK' ? 'công việc' : 'ghi chú'} *
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={type === 'TASK' ? 'VD: Hoàn thiện báo cáo Chương 2...' : 'VD: Tóm tắt bài giảng tuần 3...'}
              maxLength={255}
              style={{
                width: '100%', padding: '10px 12px', fontSize: '14px',
                background: 'var(--background)', border: '1px solid var(--border-subtle)',
                borderRadius: '8px', color: 'var(--text-primary)', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary-blue)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {type === 'TASK' ? 'Mô tả chi tiết' : 'Nội dung ghi chú'}
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={type === 'TASK' ? 'Các bước thực hiện, ghi chú bổ sung...' : 'Nội dung chi tiết, các ý chính...'}
              rows={type === 'NOTE' ? 5 : 3}
              style={{
                width: '100%', padding: '10px 12px', fontSize: '14px',
                background: 'var(--background)', border: '1px solid var(--border-subtle)',
                borderRadius: '8px', color: 'var(--text-primary)', outline: 'none',
                boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary-blue)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          </div>

          {/* Priority & Due Date (For Task) */}
          {type === 'TASK' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* Priority */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Độ ưu tiên
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      style={{
                        flex: 1, padding: '7px 4px', fontSize: '12px', fontWeight: 600,
                        borderRadius: '6px', cursor: 'pointer', textAlign: 'center',
                        background: priority === p.value ? p.bg : 'var(--background)',
                        color: priority === p.value ? p.color : 'var(--text-secondary)',
                        border: priority === p.value ? `1.5px solid ${p.color}` : '1px solid var(--border-subtle)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Hạn chót
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px', fontSize: '13px',
                      background: 'var(--background)', border: '1px solid var(--border-subtle)',
                      borderRadius: '8px', color: 'var(--text-primary)', outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Space Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Gắn vào Không gian
            </label>
            <select
              value={spaceId}
              onChange={e => setSpaceId(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px', fontSize: '14px',
                background: 'var(--background)', border: '1px solid var(--border-subtle)',
                borderRadius: '8px', color: 'var(--text-primary)', outline: 'none',
                boxSizing: 'border-box', cursor: 'pointer',
              }}
            >
              <option value="">-- Không gán Không gian (Chung) --</option>
              {spaces.map(s => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '16px', padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: '13px',
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px', borderRadius: '8px', fontWeight: 500, fontSize: '14px',
                background: 'transparent', border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--background)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '9px 22px', borderRadius: '8px', fontWeight: 600, fontSize: '14px',
                background: 'var(--primary-blue)', border: 'none', color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                transition: 'all 0.15s',
              }}
            >
              {loading ? 'Đang tạo...' : type === 'TASK' ? '✨ Tạo Công việc' : '✨ Tạo Ghi chú'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
