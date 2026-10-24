'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from '../Auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Nếu đã đăng nhập thì tự động chuyển vào Dashboard
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  // Bị đưa về đây do phiên hết hạn (xem lib/api.ts)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('expired')) {
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác');
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
          <h1 className={styles.brandTitle}>Đăng nhập Study & Work</h1>
          <p className={styles.brandSubtitle}>
            Hệ thống Quản lý Học tập & Công việc Cá nhân
          </p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ví dụ: demo@example.com"
          />

          <Input
            label="Mật khẩu"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '6px' }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        <div className={styles.footerText}>
          Chưa có tài khoản?{' '}
          <Link href="/register" className={styles.footerLink}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
