'use client';

import React, { useState } from 'react';
import {
  X,
  CheckSquare,
  FileText,
  Calendar,
  Link2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { ObjectType, Priority, TaskStatus, AppObject, CreateObjectPayload } from '@/lib/objects-api';
import { useSpaces } from '@/hooks/useSpaces';
import { useCreateObject } from '@/hooks/useObjects';
import { useToast } from '@/components/ui/Toast';

interface Props {
  initialSpaceId?: string;
  spaceId?: string;
  initialType?: ObjectType;
  initialStatus?: TaskStatus;
  initialDueDate?: string;
  onClose: () => void;
  onCreated?: (object: AppObject) => void;
}

const PRIORITIES: { value: Priority; label: string; color: string; bg: string }[] = [
  { value: 'LOW', label: 'Thấp', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  { value: 'MEDIUM', label: 'Trung bình', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  { value: 'HIGH', label: 'Cao', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { value: 'URGENT', label: 'Khẩn cấp', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
];

export default function CreateObjectModal({
  initialSpaceId,
  spaceId: propSpaceId,
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
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [url, setUrl] = useState('');
  const [spaceId, setSpaceId] = useState<string>(initialSpaceId || propSpaceId || '');
  const [error, setError] = useState('');

  const { data: spaces = [] } = useSpaces();
  const createObjectMutation = useCreateObject();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return;
    }

    if (type === 'EVENT') {
      if (startAt && endAt && new Date(endAt).getTime() <= new Date(startAt).getTime()) {
        setError('Thời gian kết thúc phải sau thời gian bắt đầu');
        return;
      }
    }

    if (type === 'REFERENCE' && url) {
      try {
        new URL(url);
      } catch {
        setError('Vui lòng nhập đường dẫn URL hợp lệ (ví dụ: https://...)');
        return;
      }
    }

    setError('');

    try {
      const payload: CreateObjectPayload = {
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        ...(type === 'TASK' && {
          priority,
          status: initialStatus || 'TODO',
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        }),
        ...(type === 'EVENT' && {
          priority,
          startAt: startAt ? new Date(startAt).toISOString() : undefined,
          endAt: endAt ? new Date(endAt).toISOString() : undefined,
        }),
        ...(type === 'REFERENCE' && {
          url: url.trim() || undefined,
        }),
        spaceId: spaceId || undefined,
      };

      const created = await createObjectMutation.mutateAsync(payload);
      toast.success(`Đã tạo "${created.title}" thành công!`);
      onCreated?.(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể tạo mới. Vui lòng thử lại.');
    }
  };

  const getTypeName = () => {
    switch (type) {
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
        if (e.target === e.currentTarget && !createObjectMutation.isPending) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-object-modal-title"
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          width: '560px',
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
            <h2 id="create-object-modal-title" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Tạo {getTypeName()} mới
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Kiến trúc Hybrid Object — Độc lập và liên kết chéo linh hoạt
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={createObjectMutation.isPending}
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

        {/* 4 Tabs: Task, Note, Event, Reference */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--canvas-bg)',
            padding: '6px 16px',
            gap: '6px',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setType('TASK')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              background: type === 'TASK' ? 'var(--surface)' : 'transparent',
              color: type === 'TASK' ? 'var(--tag-task-text)' : 'var(--text-secondary)',
              border: type === 'TASK' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              whiteSpace: 'nowrap',
            }}
          >
            <CheckSquare size={15} />
            Công việc
          </button>

          <button
            type="button"
            onClick={() => setType('NOTE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              background: type === 'NOTE' ? 'var(--surface)' : 'transparent',
              color: type === 'NOTE' ? 'var(--tag-note-text)' : 'var(--text-secondary)',
              border: type === 'NOTE' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              whiteSpace: 'nowrap',
            }}
          >
            <FileText size={15} />
            Ghi chú
          </button>

          <button
            type="button"
            onClick={() => setType('EVENT')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              background: type === 'EVENT' ? 'var(--surface)' : 'transparent',
              color: type === 'EVENT' ? 'var(--tag-event-text)' : 'var(--text-secondary)',
              border: type === 'EVENT' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              whiteSpace: 'nowrap',
            }}
          >
            <Calendar size={15} />
            Sự kiện
          </button>

          <button
            type="button"
            onClick={() => setType('REFERENCE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              background: type === 'REFERENCE' ? 'var(--surface)' : 'transparent',
              color: type === 'REFERENCE' ? 'var(--tag-ref-text)' : 'var(--text-secondary)',
              border: type === 'REFERENCE' ? '1px solid var(--border-subtle)' : '1px solid transparent',
              whiteSpace: 'nowrap',
            }}
          >
            <Link2 size={15} />
            Tài liệu
          </button>
        </div>

        {/* Form Body */}
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
              placeholder={
                type === 'TASK'
                  ? 'VD: Viết tài liệu chương 3...'
                  : type === 'NOTE'
                  ? 'VD: Tổng hợp kiến trúc Clean Architecture...'
                  : type === 'EVENT'
                  ? 'VD: Họp báo cáo tiến độ tuần với GVHD...'
                  : 'VD: React Documentation v18...'
              }
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

          {/* Reference URL Field */}
          {type === 'REFERENCE' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Đường dẫn liên kết (URL) *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
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
          )}

          {/* Description / Content */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {type === 'NOTE' ? 'Nội dung ghi chú' : 'Mô tả chi tiết'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chi tiết nội dung (hỗ trợ văn bản nhiều dòng)..."
              rows={type === 'NOTE' ? 5 : 3}
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
          {type === 'TASK' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Hạn chót hoàn thành (Deadline)
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

          {/* Event Start & End Date */}
          {type === 'EVENT' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Bắt đầu *
                </label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  required
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
                  Kết thúc *
                </label>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  required
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

          {/* Priority (cho Task và Event) */}
          {(type === 'TASK' || type === 'EVENT') && (
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

          {/* Space Assignment */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Gán vào Không gian
            </label>
            <select
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
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
            >
              <option value="">Không gán (Lưu vào Hộp nhận tự do / Unassigned)</option>
              {spaces.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.icon} {sp.name}
                </option>
              ))}
            </select>
          </div>

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
              disabled={createObjectMutation.isPending}
              className="btn-secondary"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={createObjectMutation.isPending}
              className="btn-primary"
            >
              {createObjectMutation.isPending ? 'Đang tạo...' : `✨ Tạo ${getTypeName()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
