'use client';

import React, { forwardRef } from 'react';
import { Calendar } from 'lucide-react';
import styles from './DatePicker.module.css';

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  enableTime?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, enableTime = false, className = '', id, type, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const inputType = type || (enableTime ? 'datetime-local' : 'date');

    return (
      <div className={styles.container}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.inputWrapper}>
          <span className={styles.icon}>
            <Calendar size={16} />
          </span>
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`${styles.input} ${error ? styles.error : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';
