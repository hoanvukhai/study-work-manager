'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('hoan@example.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Nếu đã đăng nhập thì tự động chuyển vào Dashboard
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

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
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--canvas-bg, #f8f9fa)',
      padding: '24px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-subtle, #e0e0e0)',
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--primary-blue, #1a73e8)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '22px',
            marginBottom: '12px',
          }}>
            S
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary, #202124)', margin: '0 0 6px 0' }}>
            Đăng nhập Study & Work
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary, #5f6368)', margin: 0 }}>
            Hệ thống Quản lý Học tập & Công việc Cá nhân
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fce8e6',
            color: '#c5221f',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '18px',
            border: '1px solid #fad2cf',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #202124)', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ví dụ: hoan@example.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle, #dadce0)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #202124)', marginBottom: '6px' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle, #dadce0)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{
            backgroundColor: '#f1f3f4',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#5f6368',
            lineHeight: 1.5,
          }}>
            🔑 <strong>Tài khoản mẫu:</strong><br />
            Email: <code>hoan@example.com</code><br />
            Mật khẩu: <code>Password123!</code>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-blue, #1a73e8)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '4px',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '13px', color: 'var(--text-secondary, #5f6368)' }}>
          Chưa có tài khoản?{' '}
          <Link href="/register" style={{ color: 'var(--primary-blue, #1a73e8)', fontWeight: 600, textDecoration: 'none' }}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
