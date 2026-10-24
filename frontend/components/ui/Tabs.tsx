'use client';

import React from 'react';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  children,
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.tabList} role="tablist">
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              className={`${styles.tabTrigger} ${isActive ? styles.tabTriggerActive : ''}`}
              onClick={() => onChange(tab.id)}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`${styles.count} ${isActive ? styles.countActive : ''}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
};
