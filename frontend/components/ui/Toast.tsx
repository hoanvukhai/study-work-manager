'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  onUndo?: () => void;
  undoText?: string;
  duration?: number;
}

export interface AddToastOptions {
  title?: string;
  description?: string;
  variant?: 'success' | 'danger' | 'error' | 'info' | 'default';
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export interface ToastActionOptions {
  onUndo?: () => void;
  undoText?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastContextType {
  show: (item: Omit<ToastItem, 'id'>) => void;
  addToast: (options: AddToastOptions) => void;
  success: (message: string, options?: ToastActionOptions) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    ({ type, title, message, onUndo, undoText = 'Hoàn tác', duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, onUndo, undoText, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  const addToast = useCallback(
    ({ title, description = '', variant = 'info', action, duration = 4000 }: AddToastOptions) => {
      const type: 'success' | 'error' | 'info' =
        variant === 'danger' || variant === 'error'
          ? 'error'
          : variant === 'success'
          ? 'success'
          : 'info';

      show({
        type,
        title,
        message: description || title || '',
        onUndo: action?.onClick,
        undoText: action?.label || 'Hoàn tác',
        duration,
      });
    },
    [show],
  );

  const success = useCallback(
    (message: string, options?: ToastActionOptions) => {
      show({
        type: 'success',
        message,
        onUndo: options?.onUndo || options?.action?.onClick,
        undoText: options?.undoText || options?.action?.label,
        duration: options?.duration ?? 4500,
      });
    },
    [show],
  );

  const error = useCallback(
    (message: string, duration = 5000) => {
      show({ type: 'error', message, duration });
    },
    [show],
  );

  const info = useCallback(
    (message: string, duration = 3500) => {
      show({ type: 'info', message, duration });
    },
    [show],
  );

  return (
    <ToastContext.Provider value={{ show, addToast, success, error, info }}>
      {children}
      <div className={styles.toastContainer} role="region" aria-label="Thông báo hệ thống">
        {toasts.map((toast) => {
          const typeClass =
            toast.type === 'success'
              ? styles.toastSuccess
              : toast.type === 'error'
              ? styles.toastError
              : styles.toastInfo;

          return (
            <div key={toast.id} className={`${styles.toast} ${typeClass}`}>
              <div className={styles.content}>
                {toast.type === 'success' && <CheckCircle2 size={18} color="var(--success)" />}
                {toast.type === 'error' && <AlertCircle size={18} color="var(--danger)" />}
                {toast.type === 'info' && <Info size={18} color="var(--primary-blue)" />}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {toast.title && toast.title !== toast.message && (
                    <strong style={{ fontSize: '13px', fontWeight: 600 }}>{toast.title}</strong>
                  )}
                  <span className={styles.message}>{toast.message}</span>
                </div>
              </div>
              <div className={styles.actions}>
                {toast.onUndo && (
                  <button
                    className={styles.undoBtn}
                    onClick={() => {
                      toast.onUndo?.();
                      removeToast(toast.id);
                    }}
                  >
                    {toast.undoText}
                  </button>
                )}
                <button
                  className={styles.closeBtn}
                  onClick={() => removeToast(toast.id)}
                  aria-label="Đóng thông báo"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast phải được dùng bên trong ToastProvider');
  }
  return ctx;
}
