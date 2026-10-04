'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { updateObject, AppObject, Priority, TaskStatus, UpdateObjectPayload } from '@/lib/objects-api';

interface Props {
  object: AppObject;
  onClose: () => void;
  onUpdated: (object: AppObject) => void;
}

const PRIORITIES: { value: Priority; label: string; color: string; bg: string }[] = [
  { value: 'LOW', label: 'Thấp', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  { value: 'MEDIUM', label: 'Trung bình', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  { value: 'HIGH', label: 'Cao', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { value: 'URGENT', label: 'Khẩn cấp', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
];

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'Cần làm' },
  { value: 'IN_PROGRESS', label: 'Đang làm' },
  { value: 'DONE', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

export default function EditObjectModal({ object, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState(object.title);
  const [description, setDescription] = useState(object.description || '');
  const [status, setStatus] = useState<TaskStatus>(object.status);
  const [priority, setPriority] = useState<Priority>(object.priority);
  const [dueDate, setDueDate] = useState(
    object.dueDate ? new Date(object.dueDate).toISOString().split('T')[0] : '',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Tiêu đề không được để trống');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload: UpdateObjectPayload = {
        title: title.trim(),
        description: description.trim() || null,
        ...(object.type === 'TASK' && {
          status,
          priority,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        }),
      };

      const updated = await updateObject(object.id, payload);
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể cập nhật. Vui lòng thử lại.');
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
        width: '520px',
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
              Chỉnh sửa {object.type === 'TASK' ? 'Công việc' : 'Ghi chú'}
            </h2>
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

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Tiêu đề *
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={255}
              style={{
                width: '100%', padding: '10px 12px', fontSize: '14px',
                background: 'var(--background)', border: '1px solid var(--border-subtle)',
                borderRadius: '8px', color: 'var(--text-primary)', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Mô tả / Nội dung
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={object.type === 'NOTE' ? 6 : 3}
              style={{
                width: '100%', padding: '10px 12px', fontSize: '14px',
                background: 'var(--background)', border: '1px solid var(--border-subtle)',
                borderRadius: '8px', color: 'var(--text-primary)', outline: 'none',
                boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit',
              }}
            />
          </div>

          {object.type === 'TASK' && (
            <>
              {/* Status */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Trạng thái
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {STATUSES.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStatus(s.value)}
                      style={{
                        flex: 1, padding: '8px 4px', fontSize: '12px', fontWeight: 600,
                        borderRadius: '6px', cursor: 'pointer', textAlign: 'center',
                        background: status === s.value ? 'var(--primary-blue)' : 'var(--background)',
                        color: status === s.value ? '#ffffff' : 'var(--text-secondary)',
                        border: status === s.value ? '1px solid var(--primary-blue)' : '1px solid var(--border-subtle)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority & Due Date */}
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
                          flex: 1, padding: '7px 2px', fontSize: '11px', fontWeight: 600,
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
            </>
          )}

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
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px', borderRadius: '8px', fontWeight: 500, fontSize: '14px',
                background: 'transparent', border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)', cursor: 'pointer',
              }}
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
              }}
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
