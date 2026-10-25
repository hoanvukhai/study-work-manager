'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from '../Auth.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không gửi được yêu cầu. Thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authCard}>
        <div className={styles.brandHeader}>
          <div className={styles.brandIcon}>S</div>
          <h1 className={styles.brandTitle}>Quên mật khẩu</h1>
          <p className={styles.brandSubtitle}>Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>
        </div>

        {sent ? (
          <div className={styles.form}>
            <div className={styles.errorBox} style={{ background: 'var(--primary-blue-subtle)', color: 'var(--primary-blue)' }}>
              Nếu email này đã đăng ký, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Liên kết có hiệu lực 30 phút — hãy kiểm tra cả
              hộp thư rác.
            </div>
          </div>
        ) : (
          <>
            {error && <div className={styles.errorBox}>{error}</div>}
            <form onSubmit={submit} className={styles.form}>
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ví dụ: demo@example.com"
              />
              <Button type="submit" variant="primary" disabled={loading || !email} style={{ width: '100%', marginTop: 6 }}>
                {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
              </Button>
            </form>
          </>
        )}

        <div className={styles.footerText}>
          <Link href="/login" className={styles.footerLink}>
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
