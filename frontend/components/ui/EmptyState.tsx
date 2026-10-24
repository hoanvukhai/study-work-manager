'use client';

import React from 'react';
import { Inbox } from 'lucide-react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon = <Inbox size={28} />,
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
