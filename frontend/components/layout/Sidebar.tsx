'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Trash2, Plus,
  ChevronDown, ChevronRight, Loader2,
} from 'lucide-react';
import { getSpaces, Space, deleteSpace, updateSpace } from '../../lib/spaces-api';
import CreateSpaceModal from '../spaces/CreateSpaceModal';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [spacesExpanded, setSpacesExpanded] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ spaceId: string; x: number; y: number } | null>(null);

  const loadSpaces = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSpaces();
      setSpaces(data.filter(s => !s.parentId));
    } catch {
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when navigating between pages (covers create/delete from detail page)
  useEffect(() => { loadSpaces(); }, [loadSpaces, pathname]);

  useEffect(() => {
    if (contextMenu) {
      const close = () => setContextMenu(null);
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [contextMenu]);

  const handleSpaceCreated = (space: Space) => {
    if (!space.parentId) setSpaces(prev => [...prev, space]);
    else loadSpaces();
    router.push(`/spaces/${space.id}`);
  };

  const handleArchive = async (spaceId: string) => {
    try {
      await updateSpace(spaceId, { isArchived: true });
      setSpaces(prev => prev.filter(s => s.id !== spaceId));
      if (pathname === `/spaces/${spaceId}`) {
        router.push('/');
      }
    } catch {}
    setContextMenu(null);
  };

  const handleDelete = async (spaceId: string) => {
    if (!confirm('Xoá Không gian này? Dữ liệu sẽ bị xoá vĩnh viễn.')) return;
    try {
      await deleteSpace(spaceId);
      setSpaces(prev => prev.filter(s => s.id !== spaceId));
      if (pathname === `/spaces/${spaceId}`) {
        router.push('/');
      }
    } catch {}
    setContextMenu(null);
  };

  const isActive = (href: string) => pathname === href;

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '8px 12px', borderRadius: 'var(--radius-md)',
    fontSize: '14px', fontWeight: active ? 600 : 500,
    color: active ? 'var(--tag-task-text)' : 'var(--text-secondary)',
    background: active ? 'var(--tag-task-bg)' : 'transparent',
    transition: 'all 0.15s', textDecoration: 'none',
  });

  return (
    <>
      <aside style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        height: '100vh', position: 'sticky', top: 0,
      }}>
        {/* Brand */}
        <div style={{
          padding: '20px', display: 'flex', alignItems: 'center', gap: '10px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'var(--primary-blue)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', fontWeight: 700, fontSize: '16px',
          }}>S</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>Study & Work</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Personal Workspace</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
          {/* Core Nav */}
          <div style={{ marginBottom: '8px' }}>
            <Link href="/" style={navLinkStyle(isActive('/'))}
              onMouseEnter={e => { if (!isActive('/')) e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--border-subtle)'; }}
              onMouseLeave={e => { if (!isActive('/')) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}>
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          </div>


          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 0 16px' }} />

          {/* Spaces */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 4px 8px', cursor: 'pointer',
            }}>
              <button onClick={() => setSpacesExpanded(p => !p)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.05em', color: 'var(--text-secondary)',
                background: 'transparent', border: 'none', cursor: 'pointer', padding: '0',
              }}>
                {spacesExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Không gian (Spaces)
              </button>
              <button
                onClick={() => setShowModal(true)}
                title="Tạo Không gian mới"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', padding: '2px 4px', borderRadius: '4px',
                  display: 'flex', alignItems: 'center', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <Plus size={14} />
              </button>
            </div>

            {spacesExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Đang tải...
                  </div>
                ) : spaces.length === 0 ? (
                  <div style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Chưa có Không gian nào.{' '}
                    <button onClick={() => setShowModal(true)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--primary-blue)', fontStyle: 'italic', fontSize: '13px', padding: 0,
                    }}>Tạo ngay →</button>
                  </div>
                ) : (
                  spaces.map(space => {
                    const active = pathname === `/spaces/${space.id}`;
                    return (
                      <div key={space.id} style={{ position: 'relative' }}
                        onContextMenu={e => { e.preventDefault(); setContextMenu({ spaceId: space.id, x: e.clientX, y: e.clientY }); }}>
                        <Link href={`/spaces/${space.id}`} style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '7px 12px', borderRadius: 'var(--radius-md)',
                          fontSize: '14px', fontWeight: active ? 600 : 400,
                          color: active ? 'var(--text-primary)' : 'var(--text-primary)',
                          background: active ? space.color + '22' : 'transparent',
                          textDecoration: 'none', transition: 'all 0.15s',
                          border: active ? `1px solid ${space.color}44` : '1px solid transparent',
                        }}
                          onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--border-subtle)'; }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                          <span style={{
                            width: '20px', height: '20px', borderRadius: '5px',
                            background: space.color + '33', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0,
                          }}>{space.icon}</span>
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {space.name}
                          </span>
                          {space._count && space._count.spaceObjects > 0 && (
                            <span style={{
                              fontSize: '11px', color: 'var(--text-secondary)',
                              background: 'var(--border-subtle)', borderRadius: '10px',
                              padding: '1px 6px', flexShrink: 0,
                            }}>{space._count.spaceObjects}</span>
                          )}
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

        </div>


        {/* Footer */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          <Link href="/trash" style={navLinkStyle(isActive('/trash'))}
            onMouseEnter={e => { if (!isActive('/trash')) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--border-subtle)'; } }}
            onMouseLeave={e => { if (!isActive('/trash')) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}>
            <Trash2 size={16} />
            Thùng rác
          </Link>
        </div>
      </aside>

      {/* Context Menu */}
      {contextMenu && (
        <div onClick={e => e.stopPropagation()} style={{
          position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 2000,
          background: 'var(--surface)', border: '1px solid var(--border-subtle)',
          borderRadius: '8px', padding: '4px', minWidth: '160px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          <button onClick={() => handleArchive(contextMenu.spaceId)} style={{
            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
            padding: '8px 12px', borderRadius: '6px', background: 'none', border: 'none',
            color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', textAlign: 'left',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--border-subtle)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            📦 Lưu trữ
          </button>
          <button onClick={() => handleDelete(contextMenu.spaceId)} style={{
            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
            padding: '8px 12px', borderRadius: '6px', background: 'none', border: 'none',
            color: '#ef4444', fontSize: '13px', cursor: 'pointer', textAlign: 'left',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            🗑️ Xoá
          </button>
        </div>
      )}

      {/* Create Space Modal */}
      {showModal && (
        <CreateSpaceModal
          onClose={() => setShowModal(false)}
          onCreated={handleSpaceCreated}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
