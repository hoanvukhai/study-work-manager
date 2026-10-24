'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  CheckSquare,
  FileText,
  Calendar,
  Link2,
  Folder,
  Inbox,
  LayoutGrid,
  Trash2,
  Archive,
  User,
  Plus,
  ArrowRight,
} from 'lucide-react';
import styles from './CommandPalette.module.css';
import { useSpaces } from '@/hooks/useSpaces';
import { useObjects } from '@/hooks/useObjects';
import { ObjectType } from '@/lib/objects-api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectObject?: (id: string) => void;
  onCreateObject?: (type?: ObjectType) => void;
}

const TYPE_ICONS: Record<ObjectType, React.ReactNode> = {
  TASK: <CheckSquare size={16} color="var(--tag-task-text)" />,
  NOTE: <FileText size={16} color="var(--tag-note-text)" />,
  EVENT: <Calendar size={16} color="var(--tag-event-text)" />,
  REFERENCE: <Link2 size={16} color="var(--tag-ref-text)" />,
};

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectObject,
  onCreateObject,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: spaces = [] } = useSpaces();
  const { data: objects = [] } = useObjects({
    search: query.trim() || undefined,
    lifecycle: 'ACTIVE',
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter spaces locally
  const filteredSpaces = spaces.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()),
  );

  // Quick navigation items when query is empty or matches
  const quickNav = [
    { label: 'Hộp nhận', path: '/inbox', icon: <Inbox size={16} /> },
    { label: 'Bảng việc Kanban', path: '/kanban', icon: <LayoutGrid size={16} /> },
    { label: 'Lịch trình', path: '/calendar', icon: <Calendar size={16} /> },
    { label: 'Kho Lưu trữ', path: '/archive', icon: <Archive size={16} /> },
    { label: 'Thùng rác', path: '/trash', icon: <Trash2 size={16} /> },
    { label: 'Hồ sơ cá nhân', path: '/profile', icon: <User size={16} /> },
  ].filter(
    (item) => !query || item.label.toLowerCase().includes(query.toLowerCase()),
  );

  // Compile all selectable items for arrow-key navigation
  interface SelectableItem {
    type: 'nav' | 'space' | 'object' | 'create';
    id: string;
    action: () => void;
  }

  const allItems: SelectableItem[] = [];

  if (query.trim()) {
    if (onCreateObject) {
      allItems.push({
        type: 'create',
        id: 'create-task',
        action: () => {
          onCreateObject('TASK');
          onClose();
        },
      });
    }

    filteredSpaces.forEach((s) =>
      allItems.push({
        type: 'space',
        id: s.id,
        action: () => {
          router.push(`/spaces/${s.id}`);
          onClose();
        },
      }),
    );

    objects.forEach((o) =>
      allItems.push({
        type: 'object',
        id: o.id,
        action: () => {
          if (onSelectObject) onSelectObject(o.id);
          onClose();
        },
      }),
    );
  } else {
    quickNav.forEach((nav) =>
      allItems.push({
        type: 'nav',
        id: nav.path,
        action: () => {
          router.push(nav.path);
          onClose();
        },
      }),
    );

    spaces.slice(0, 5).forEach((s) =>
      allItems.push({
        type: 'space',
        id: s.id,
        action: () => {
          router.push(`/spaces/${s.id}`);
          onClose();
        },
      }),
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? (allItems.length || 1) - 1 : prev - 1,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  let currentItemCounter = -1;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.searchHeader}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.searchInput}
            placeholder="Tìm kiếm không gian, công việc, ghi chú hoặc gõ lệnh..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <span className={styles.escBadge}>ESC</span>
        </div>

        <div className={styles.resultsList}>
          {/* Quick Create Action when query exists */}
          {query.trim() && onCreateObject && (
            <div>
              <div className={styles.groupTitle}>Thao tác nhanh</div>
              {(() => {
                currentItemCounter++;
                const isSelected = selectedIndex === currentItemCounter;
                return (
                  <button
                    className={`${styles.resultItem} ${
                      isSelected ? styles.resultItemActive : ''
                    }`}
                    onClick={() => {
                      onCreateObject('TASK');
                      onClose();
                    }}
                  >
                    <div className={styles.itemLeft}>
                      <div className={styles.itemIcon}>
                        <Plus size={16} />
                      </div>
                      <span className={styles.itemTitle}>
                        Tạo công việc mới: &ldquo;{query.trim()}&rdquo;
                      </span>
                    </div>
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </button>
                );
              })()}
            </div>
          )}

          {/* Spaces */}
          {filteredSpaces.length > 0 && (
            <div>
              <div className={styles.groupTitle}>Không gian</div>
              {filteredSpaces.map((s) => {
                currentItemCounter++;
                const isSelected = selectedIndex === currentItemCounter;
                return (
                  <button
                    key={s.id}
                    className={`${styles.resultItem} ${
                      isSelected ? styles.resultItemActive : ''
                    }`}
                    onClick={() => {
                      router.push(`/spaces/${s.id}`);
                      onClose();
                    }}
                  >
                    <div className={styles.itemLeft}>
                      <span style={{ fontSize: 16 }}>{s.icon || '📁'}</span>
                      <span className={styles.itemTitle}>{s.name}</span>
                    </div>
                    <span className={styles.itemSub}>Không gian</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Objects (When querying) */}
          {query.trim() && objects.length > 0 && (
            <div>
              <div className={styles.groupTitle}>Đối tượng & Ghi chú</div>
              {objects.map((o) => {
                currentItemCounter++;
                const isSelected = selectedIndex === currentItemCounter;
                return (
                  <button
                    key={o.id}
                    className={`${styles.resultItem} ${
                      isSelected ? styles.resultItemActive : ''
                    }`}
                    onClick={() => {
                      if (onSelectObject) onSelectObject(o.id);
                      onClose();
                    }}
                  >
                    <div className={styles.itemLeft}>
                      <div className={styles.itemIcon}>
                        {TYPE_ICONS[o.type]}
                      </div>
                      <span className={styles.itemTitle}>{o.title}</span>
                    </div>
                    <span className={styles.itemSub}>
                      {o.status ? `[${o.status}]` : o.type}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Nav (When no query or filtered) */}
          {!query.trim() && (
            <div>
              <div className={styles.groupTitle}>Chuyển nhanh</div>
              {quickNav.map((nav) => {
                currentItemCounter++;
                const isSelected = selectedIndex === currentItemCounter;
                return (
                  <button
                    key={nav.path}
                    className={`${styles.resultItem} ${
                      isSelected ? styles.resultItemActive : ''
                    }`}
                    onClick={() => {
                      router.push(nav.path);
                      onClose();
                    }}
                  >
                    <div className={styles.itemLeft}>
                      <div className={styles.itemIcon}>{nav.icon}</div>
                      <span className={styles.itemTitle}>{nav.label}</span>
                    </div>
                    <span className={styles.itemSub}>{nav.path}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {query.trim() &&
            filteredSpaces.length === 0 &&
            objects.length === 0 && (
              <div className={styles.emptyState}>
                Không tìm thấy kết quả nào phù hợp với &ldquo;{query}&rdquo;
              </div>
            )}
        </div>

        <div className={styles.footer}>
          <div className={styles.shortcuts}>
            <span>↑↓ để di chuyển</span>
            <span>↵ để chọn</span>
            <span>esc để đóng</span>
          </div>
          <span>study-work-manager</span>
        </div>
      </div>
    </div>
  );
}
