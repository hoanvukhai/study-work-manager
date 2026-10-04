'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

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

    if (password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự');
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
        maxWidth: '440px',
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
            Tạo tài khoản mới
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary, #5f6368)', margin: 0 }}>
            Bắt đầu tổ chức học tập và công việc theo cách thông minh
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
              Họ và tên
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="ví dụ: Vũ Khải Hoàn"
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
              placeholder="Tối thiểu 6 ký tự..."
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
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu..."
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
            }}
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '13px', color: 'var(--text-secondary, #5f6368)' }}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={{ color: 'var(--primary-blue, #1a73e8)', fontWeight: 600, textDecoration: 'none' }}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
