'use client';

import React from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style,
}: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <Skeleton width="40%" height="18px" />
      <Skeleton width="90%" height="14px" />
      <Skeleton width="60%" height="14px" />
      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
        <Skeleton width="60px" height="22px" borderRadius="12px" />
        <Skeleton width="80px" height="22px" borderRadius="12px" />
      </div>
    </div>
  );
}
