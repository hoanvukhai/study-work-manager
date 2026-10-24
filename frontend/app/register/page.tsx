'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from '../Auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { user, register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có tối thiểu 8 ký tự');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, fullName);
    } catch (err: any) {
      setError(err.message || 'Đăng ký tài khoản thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authCard}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.brandIcon}>S</div>
          <h1 className={styles.brandTitle}>Tạo tài khoản mới</h1>
          <p className={styles.brandSubtitle}>
            Bắt đầu tổ chức học tập và công việc theo cách thông minh
          </p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Họ và tên"
            type="text"
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="ví dụ: Nguyễn Văn An"
          />

          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ví dụ: user@example.com"
          />

          <Input
            label="Mật khẩu"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Tối thiểu 8 ký tự..."
          />

          <Input
            label="Xác nhận mật khẩu"
            type="password"
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu..."
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '6px' }}
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
          </Button>
        </form>

        <div className={styles.footerText}>
          Đã có tài khoản?{' '}
          <Link href="/login" className={styles.footerLink}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
