'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from '../Auth.module.css';

function ResetForm() {
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }
    setLoading(true);
    try {
      await apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword: password }) });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đặt lại được mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.form}>
        <div className={styles.errorBox}>Liên kết không hợp lệ. Hãy yêu cầu một liên kết mới.</div>
        <Link href="/forgot-password" className={styles.footerLink}>
          Yêu cầu liên kết mới
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className={styles.form}>
        <div className={styles.errorBox} style={{ background: 'var(--primary-blue-subtle)', color: 'var(--primary-blue)' }}>
          Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.
        </div>
        <Link href="/login">
          <Button variant="primary" style={{ width: '100%' }}>
            Đến trang đăng nhập
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && <div className={styles.errorBox}>{error}</div>}
      <form onSubmit={submit} className={styles.form}>
        <Input label="Mật khẩu mới" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tối thiểu 8 ký tự" />
        <Input label="Nhập lại mật khẩu mới" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <Button type="submit" variant="primary" disabled={loading || password.length < 8} style={{ width: '100%', marginTop: 6 }}>
          {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authCard}>
        <div className={styles.brandHeader}>
          <div className={styles.brandIcon}>S</div>
          <h1 className={styles.brandTitle}>Đặt lại mật khẩu</h1>
          <p className={styles.brandSubtitle}>Chọn mật khẩu mới cho tài khoản của bạn.</p>
        </div>
        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
        <div className={styles.footerText}>
          <Link href="/login" className={styles.footerLink}>
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
