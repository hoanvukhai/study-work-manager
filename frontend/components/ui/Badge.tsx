'use client';

import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  variant?:
    | 'task'
    | 'note'
    | 'event'
    | 'reference'
    | 'urgent'
    | 'neutral'
    | 'default'
    | 'success'
    | 'warning'
    | 'danger';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, icon, className = '' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </span>
  );
}
