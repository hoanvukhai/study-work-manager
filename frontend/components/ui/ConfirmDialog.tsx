'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  isOpen?: boolean;
  open?: boolean;
  title: string;
  message?: string;
  description?: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  open,
  title,
  message,
  description,
  confirmText,
  confirmLabel,
  cancelText = 'Hủy bỏ',
  cancelLabel,
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isDialogVisible = open !== undefined ? open : (isOpen ?? false);
  const dialogMessage = description || message || '';
  const finalConfirmText = confirmLabel || confirmText || 'Xác nhận';
  const finalCancelText = cancelLabel || cancelText || 'Hủy bỏ';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDialogVisible && !loading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialogVisible, loading, onCancel]);

  if (!isDialogVisible) return null;

  const iconClass =
    variant === 'danger'
      ? styles.iconDanger
      : variant === 'warning'
      ? styles.iconWarning
      : styles.iconPrimary;

  const confirmBtnClass =
    variant === 'danger'
      ? styles.confirmDanger
      : variant === 'warning'
      ? styles.confirmWarning
      : styles.confirmPrimary;

  return (
    <div className={styles.backdrop} onClick={() => !loading && onCancel()}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
      >
        <div className={styles.header}>
          <div className={`${styles.iconWrapper} ${iconClass}`}>
            {variant === 'danger' && <AlertTriangle size={20} />}
            {variant === 'warning' && <AlertCircle size={20} />}
            {variant === 'primary' && <Info size={20} />}
          </div>
          <h3 id="confirm-dialog-title" className={styles.title}>
            {title}
          </h3>
        </div>

        <p id="confirm-dialog-desc" className={styles.message}>
          {dialogMessage}
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            {finalCancelText}
          </button>
          <button
            type="button"
            className={`${styles.confirmBtn} ${confirmBtnClass}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : finalConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
