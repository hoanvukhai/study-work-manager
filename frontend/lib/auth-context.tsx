'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Kiểm tra token khi khởi động
  useEffect(() => {
    async function loadUserFromToken() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userData = await apiRequest<User>('/auth/me');
        setUser(userData);
      } catch (err) {
        console.warn('Phiên đăng nhập hết hạn hoặc token không hợp lệ:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUserFromToken();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<{ message: string; user: User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.accessToken) {
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
      router.push('/');
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    const res = await apiRequest<{ message: string; user: User; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });

    if (res.accessToken) {
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('user', JSON.stringify(res.user));
      setUser(res.user);
      router.push('/');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const userData = await apiRequest<User>('/auth/me');
      setUser(userData);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
