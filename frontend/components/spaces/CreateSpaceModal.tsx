'use client';

import React, { useState } from 'react';
import { useCreateSpace, useCreateSpaceFromTemplate, useSpaceTemplates } from '@/hooks/useSpaces';
import { useToast } from '@/components/ui/Toast';
import { X, Check } from 'lucide-react';

const PRESET_ICONS = ['📁', '📚', '💼', '🎯', '🚀', '🏠', '🎓', '💡', '📝', '🔬', '🎨', '🌿', '⚡', '🏗️', '🎮', '🔧'];
const PRESET_COLORS = [
  '#1a73e8', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#64748b',
  '#a855f7', '#f97316',
];

interface Props {
  onClose: () => void;
  onCreated: (space: any) => void;
}

export default function CreateSpaceModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#1a73e8');
  const [error, setError] = useState('');

  const createSpaceMutation = useCreateSpace();
  const fromTemplateMutation = useCreateSpaceFromTemplate();
  const { data: templates = [] } = useSpaceTemplates();
  const [templateId, setTemplateId] = useState<string | null>(null);

  const pickTemplate = (id: string | null) => {
    setTemplateId(id);
    const t = templates.find(x => x.id === id);
    if (t) {
      setName(t.name);
      setDescription(t.description);
      setIcon(t.icon);
      setColor(t.color);
    }
  };
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên Không gian');
      return;
    }
    setError('');

    try {
      const created = templateId
        ? await fromTemplateMutation.mutateAsync({
            templateId,
            name: name.trim(),
            description: description.trim() || undefined,
            icon,
            color,
          })
        : await createSpaceMutation.mutateAsync({
            name: name.trim(),
            description: description.trim() || undefined,
            icon,
            color,
          });
      toast.success(`Đã tạo Không gian "${created.name}" thành công`);
      onCreated(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể tạo Không gian. Vui lòng thử lại.');
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
        if (e.target === e.currentTarget && !createSpaceMutation.isPending) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-space-title"
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          width: '480px',
          maxWidth: '100%',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 id="create-space-title" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Tạo Không gian mới
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Bàn làm việc nhóm các công việc, ghi chú và lịch trình
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={createSpaceMutation.isPending}
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

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Mẫu dựng sẵn */}
          {templates.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Bắt đầu từ</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[{ id: null as string | null, label: '📄 Trống', hint: 'Tự tạo từ đầu' }, ...templates.map(t => ({ id: t.id as string | null, label: `${t.icon} ${t.name}`, hint: `${t.taskCount} việc, ${t.noteCount} ghi chú` }))].map(opt => {
                  const active = templateId === opt.id;
                  return (
                    <button
                      key={opt.id ?? 'blank'}
                      type="button"
                      onClick={() => pickTemplate(opt.id)}
                      aria-pressed={active}
                      title={opt.hint}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        fontSize: '13px',
                        border: `1px solid ${active ? 'var(--primary-blue)' : 'var(--border-subtle)'}`,
                        background: active ? 'var(--primary-blue-subtle)' : 'var(--surface)',
                        color: active ? 'var(--primary-blue)' : 'var(--text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {templateId && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Sẽ tạo kèm các việc và ghi chú khởi đầu (các bước trong chuỗi chờ bước trước). Bạn sửa hoặc xoá tự do sau đó.
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              padding: '14px 16px',
              background: 'var(--canvas-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: color + '22',
                border: `2px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>
                {name || 'Tên Không gian'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Đồ án tốt nghiệp, Việc Freelance..."
              maxLength={100}
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

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Mô tả mục tiêu
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mục tiêu hoặc tóm tắt ngắn về Không gian này..."
              rows={2}
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '14px',
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Icon Picker */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Biểu tượng
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PRESET_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  style={{
                    width: '38px',
                    height: '38px',
                    fontSize: '18px',
                    borderRadius: 'var(--radius-sm)',
                    border: ic === icon ? `2px solid ${color}` : '1px solid var(--border-subtle)',
                    background: ic === icon ? color + '22' : 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Màu chủ đạo
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: c,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: c === color ? '0 0 0 2px var(--surface), 0 0 0 4px ' + c : 'none',
                  }}
                >
                  {c === color && <Check size={14} color="white" />}
                </button>
              ))}
            </div>
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
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={createSpaceMutation.isPending}
              className="btn-secondary"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={createSpaceMutation.isPending}
              className="btn-primary"
              style={{ background: color }}
            >
              {createSpaceMutation.isPending ? 'Đang tạo...' : '✨ Tạo Không gian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
