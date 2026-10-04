'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/lib/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        backgroundColor: 'var(--canvas-bg)',
        color: 'var(--text-secondary)',
        fontSize: '14px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--primary-blue)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span>Đang tải không gian làm việc...</span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <main className="content-container">
          {children}
        </main>
      </div>
    </div>
  );
}
