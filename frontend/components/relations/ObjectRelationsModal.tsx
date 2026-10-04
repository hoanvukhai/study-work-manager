'use client';

import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Trash2, Plus, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { AppObject, getObjects } from '@/lib/objects-api';
import {
  getObjectRelations, createRelation, deleteRelation,
  ObjectRelationItem, RelationType, RELATION_LABELS,
} from '@/lib/relations-api';

interface Props {
  currentObject: AppObject;
  onClose: () => void;
}

export default function ObjectRelationsModal({ currentObject, onClose }: Props) {
  const [outgoing, setOutgoing] = useState<ObjectRelationItem[]>([]);
  const [incoming, setIncoming] = useState<ObjectRelationItem[]>([]);
  const [candidates, setCandidates] = useState<AppObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // New relation form state
  const [targetId, setTargetId] = useState('');
  const [relType, setRelType] = useState<RelationType>('REFERENCES');

  const loadData = async () => {
    setLoading(true);
    try {
      const [relData, allObjs] = await Promise.all([
        getObjectRelations(currentObject.id),
        getObjects(),
      ]);
      setOutgoing(relData.outgoing || []);
      setIncoming(relData.incoming || []);
      setCandidates(allObjs.filter(o => o.id !== currentObject.id));
    } catch {
      setError('Không thể tải danh sách liên kết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentObject.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) {
      setError('Vui lòng chọn mục để liên kết');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const created = await createRelation({
        fromObjectId: currentObject.id,
        toObjectId: targetId,
        relationType: relType,
      });
      setOutgoing(prev => [created, ...prev]);
      setTargetId('');
    } catch (err: any) {
      setError(err?.message || 'Không thể tạo liên kết. Có thể đã tồn tại liên kết này.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (relId: string) => {
    try {
      await deleteRelation(relId);
      setOutgoing(prev => prev.filter(r => r.id !== relId));
      setIncoming(prev => prev.filter(r => r.id !== relId));
    } catch (err: any) {
      alert(err?.message || 'Không thể xoá liên kết');
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        width: '560px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LinkIcon size={18} color="var(--primary-blue)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Liên kết chéo 2 chiều
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Đang xem mục: <strong>{currentObject.title}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', padding: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content list */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '8px', color: 'var(--text-secondary)' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Đang tải danh sách liên kết...
            </div>
          ) : (
            <>
              {/* Outgoing Relations */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowRight size={16} color="var(--primary-blue)" />
                  Liên kết đi (Mục này tham chiếu tới) ({outgoing.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {outgoing.map(rel => {
                    const toObj = rel.toObject;
                    return (
                      <div
                        key={rel.id}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 12px', borderRadius: '8px',
                          background: 'var(--background)', border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--primary-blue)', fontWeight: 600, flexShrink: 0 }}>
                            {RELATION_LABELS[rel.relationType]}
                          </span>
                          <span style={{ fontSize: '14px' }}>
                            {toObj?.type === 'TASK' ? '✅' : '📝'}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {toObj?.title || 'Đối tượng đích'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDelete(rel.id)}
                          title="Xoá liên kết"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#ef4444', padding: '4px', display: 'flex',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}

                  {outgoing.length === 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '6px 0' }}>
                      Chưa có liên kết chiều đi nào.
                    </div>
                  )}
                </div>
              </div>

              {/* Incoming Relations */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowLeft size={16} color="#10b981" />
                  Liên kết đến (Được tham chiếu từ) ({incoming.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {incoming.map(rel => {
                    const fromObj = rel.fromObject;
                    return (
                      <div
                        key={rel.id}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 12px', borderRadius: '8px',
                          background: 'var(--background)', border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '14px' }}>
                            {fromObj?.type === 'TASK' ? '✅' : '📝'}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {fromObj?.title || 'Đối tượng nguồn'}
                          </span>
                          <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 600, flexShrink: 0 }}>
                            {RELATION_LABELS[rel.relationType]}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {incoming.length === 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '6px 0' }}>
                      Chưa có mục nào liên kết đến mục này.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Add Relation Form */}
          <form
            onSubmit={handleCreate}
            style={{
              padding: '16px', borderRadius: '12px',
              background: 'var(--canvas-bg)', border: '1px solid var(--border-subtle)',
              marginTop: '8px',
            }}
          >
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={15} /> Thêm liên kết mới
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Loại quan hệ
                </label>
                <select
                  value={relType}
                  onChange={e => setRelType(e.target.value as RelationType)}
                  style={{
                    width: '100%', padding: '8px 10px', fontSize: '13px',
                    background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: '6px', color: 'var(--text-primary)', outline: 'none',
                  }}
                >
                  <option value="REFERENCES">Tham chiếu tài liệu (REFERENCES)</option>
                  <option value="DEPENDS_ON">Phụ thuộc tiến độ (DEPENDS_ON)</option>
                  <option value="RELATES_TO">Liên quan nội dung (RELATES_TO)</option>
                  <option value="PARENT_OF">Mục cha của (PARENT_OF)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Chọn mục đích
                </label>
                <select
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 10px', fontSize: '13px',
                    background: 'var(--surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: '6px', color: 'var(--text-primary)', outline: 'none',
                  }}
                >
                  <option value="">-- Chọn mục liên kết --</option>
                  {candidates.map(cand => (
                    <option key={cand.id} value={cand.id}>
                      {cand.type === 'TASK' ? '✅' : '📝'} {cand.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', color: '#ef4444', marginBottom: '10px',
              }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !targetId}
              style={{
                width: '100%', padding: '8px', borderRadius: '6px',
                background: 'var(--primary-blue)', color: '#ffffff',
                border: 'none', fontSize: '13px', fontWeight: 600,
                cursor: submitting || !targetId ? 'not-allowed' : 'pointer',
                opacity: submitting || !targetId ? 0.6 : 1,
              }}
            >
              {submitting ? 'Đang tạo liên kết...' : '+ Tạo liên kết'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
