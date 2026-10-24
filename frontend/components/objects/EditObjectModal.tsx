'use client';

import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { AppObject, Priority, TaskStatus, UpdateObjectPayload } from '@/lib/objects-api';
import { useUpdateObject } from '@/hooks/useObjects';
import { useToast } from '@/components/ui/Toast';

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
  const [status, setStatus] = useState<TaskStatus>(object.status || 'TODO');
  const [priority, setPriority] = useState<Priority>(object.priority || 'MEDIUM');
  const [dueDate, setDueDate] = useState(
    object.dueDate ? new Date(object.dueDate).toISOString().slice(0, 16) : '',
  );
  const [startAt, setStartAt] = useState(
    object.startAt ? new Date(object.startAt).toISOString().slice(0, 16) : '',
  );
  const [endAt, setEndAt] = useState(
    object.endAt ? new Date(object.endAt).toISOString().slice(0, 16) : '',
  );
  const [url, setUrl] = useState(object.url || '');
  const [error, setError] = useState('');

  const updateObjectMutation = useUpdateObject();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Tiêu đề không được để trống');
      return;
    }

    if (object.type === 'EVENT' && startAt && endAt) {
      if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
        setError('Thời gian kết thúc phải sau thời gian bắt đầu');
        return;
      }
    }

    if (object.type === 'REFERENCE' && url) {
      try {
        new URL(url);
      } catch {
        setError('Vui lòng nhập đường dẫn URL hợp lệ');
        return;
      }
    }

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
        ...(object.type === 'EVENT' && {
          priority,
          startAt: startAt ? new Date(startAt).toISOString() : null,
          endAt: endAt ? new Date(endAt).toISOString() : null,
        }),
        ...(object.type === 'REFERENCE' && {
          url: url.trim() || null,
        }),
      };

      const updated = await updateObjectMutation.mutateAsync({
        id: object.id,
        payload,
      });

      toast.success('Đã lưu thay đổi thành công!');
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể cập nhật. Vui lòng thử lại.');
    }
  };

  const getTypeName = () => {
    switch (object.type) {
      case 'TASK':
        return 'Công việc';
      case 'NOTE':
        return 'Ghi chú';
      case 'EVENT':
        return 'Sự kiện';
      case 'REFERENCE':
        return 'Tài liệu tham khảo';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !updateObjectMutation.isPending) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-object-modal-title"
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          width: '540px',
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 id="edit-object-modal-title" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Chỉnh sửa {getTypeName()}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Cập nhật thông tin chi tiết
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={updateObjectMutation.isPending}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', overflowY: 'auto' }}>
          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Tiêu đề *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              required
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '14px',
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Reference URL */}
          {object.type === 'REFERENCE' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Đường dẫn URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '14px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Status (cho Task) */}
          {object.type === 'TASK' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Trạng thái
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      fontWeight: status === s.value ? 600 : 500,
                      border: status === s.value ? '2px solid var(--primary-blue)' : '1px solid var(--border-subtle)',
                      background: status === s.value ? 'var(--primary-blue-subtle)' : 'var(--surface)',
                      color: status === s.value ? 'var(--primary-blue)' : 'var(--text-secondary)',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {object.type === 'NOTE' ? 'Nội dung ghi chú' : 'Mô tả chi tiết'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={object.type === 'NOTE' ? 6 : 3}
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '14px',
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Task Due Date */}
          {object.type === 'TASK' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Hạn chót hoàn thành
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  fontSize: '14px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Event start & end */}
          {object.type === 'EVENT' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Bắt đầu
                </label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    fontSize: '13px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Kết thúc
                </label>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    fontSize: '13px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* Priority (Task, Event) */}
          {(object.type === 'TASK' || object.type === 'EVENT') && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Mức độ ưu tiên
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PRIORITIES.map((p) => {
                  const selected = priority === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '13px',
                        fontWeight: selected ? 600 : 500,
                        border: selected ? `2px solid ${p.color}` : '1px solid var(--border-subtle)',
                        background: selected ? p.bg : 'var(--surface)',
                        color: selected ? p.color : 'var(--text-secondary)',
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--danger-subtle)',
                color: 'var(--danger)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={updateObjectMutation.isPending}
              className="btn-secondary"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={updateObjectMutation.isPending}
              className="btn-primary"
            >
              {updateObjectMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
