'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (res.accessToken) {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('user', JSON.stringify(res.user));
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary, #f8f9fa)',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-light, #dadce0)',
        borderRadius: '12px',
        padding: '36px 32px',
        boxShadow: '0 1px 3px rgba(60,64,67,0.08)',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '24px' }}>⚡</span>
            <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary, #202124)' }}>StudyWork</span>
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #202124)', margin: '0 0 6px 0' }}>
            Đăng nhập tài khoản
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary, #5f6368)', margin: 0 }}>
            Quản lý học tập và công việc cá nhân thông minh
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
                border: '1px solid var(--border-light, #dadce0)',
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
                border: '1px solid var(--border-light, #dadce0)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-primary, #1a73e8)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '8px',
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '13px', color: 'var(--text-secondary, #5f6368)' }}>
          Chưa có tài khoản?{' '}
          <Link href="/register" style={{ color: 'var(--accent-primary, #1a73e8)', fontWeight: 600, textDecoration: 'none' }}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
