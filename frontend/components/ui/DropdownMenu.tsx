'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './DropdownMenu.module.css';

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  dividerAfter?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`}>
      <div onClick={() => setIsOpen(prev => !prev)} style={{ cursor: 'pointer', display: 'inline-flex' }}>
        {trigger}
      </div>
      {isOpen && (
        <div className={`${styles.menu} ${align === 'left' ? styles.menuLeft : styles.menuRight}`}>
          {items.map((item, idx) => (
            <React.Fragment key={idx}>
              <button
                type="button"
                className={`${styles.item} ${item.danger ? styles.danger : ''}`}
                disabled={item.disabled}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </button>
              {item.dividerAfter && <div className={styles.divider} />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
