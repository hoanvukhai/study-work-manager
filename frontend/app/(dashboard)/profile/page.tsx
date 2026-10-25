'use client';

import React, { useState, useEffect } from 'react';
import { User, Lock, Save, KeyRound, ShieldCheck } from 'lucide-react';
import styles from './Profile.module.css';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import NotificationSettingsCard from '@/components/notifications/NotificationSettingsCard';
import CalendarFeedCard from '@/components/notifications/CalendarFeedCard';
import DataExportCard from '@/components/notifications/DataExportCard';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const toast = useToast();

  // Profile Form state
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }

    setProfileSaving(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });
      toast.success('Đã cập nhật thông tin cá nhân');
    } catch {
      toast.error('Không thể cập nhật hồ sơ');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không trùng khớp');
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Đã thay đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err?.message || 'Mật khẩu hiện tại không chính xác');
      toast.error('Đổi mật khẩu thất bại');
    } finally {
      setPasswordSaving(false);
    }
  };

  const getInitial = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    return parts[parts.length - 1]?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <User size={24} style={{ color: 'var(--primary-blue)' }} />
          Hồ sơ & Bảo mật
        </h1>
        <p className={styles.subtitle}>
          Quản lý thông tin tài khoản cá nhân và cài đặt bảo mật cho hệ thống Study & Work Manager.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <User size={18} style={{ color: 'var(--primary-blue)' }} />
          <h2 className={styles.cardTitle}>Thông tin tài khoản</h2>
        </div>

        <div className={styles.userPreview}>
          <div className={styles.avatar}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className={styles.avatarImg} />
            ) : (
              getInitial(user?.fullName)
            )}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.fullName}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {user?.email}
            </div>
            {user?.role === 'ADMIN' && (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 4,
                  backgroundColor: 'var(--primary-blue-subtle)',
                  color: 'var(--primary-blue)',
                }}
              >
                Quản trị viên (Admin)
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Địa chỉ Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className={`${styles.input} ${styles.inputDisabled}`}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Họ và tên</label>
            <input
              type="text"
              className={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên đầy đủ..."
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Đường dẫn ảnh đại diện (Avatar URL)</label>
            <input
              type="url"
              className={styles.input}
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="submit" variant="primary" disabled={profileSaving}>
              <Save size={16} /> Lưu thông tin
            </Button>
          </div>
        </form>
      </div>

      <NotificationSettingsCard />

      <CalendarFeedCard />

      <DataExportCard />

      {/* Change Password Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Lock size={18} style={{ color: 'var(--warning)' }} />
          <h2 className={styles.cardTitle}>Đổi mật khẩu</h2>
        </div>

        <form onSubmit={handleChangePassword} className={styles.formGrid}>
          {passwordError && (
            <div className={styles.errorText}>
              ● {passwordError}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu hiện tại</label>
            <input
              type="password"
              className={styles.input}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu mới (tối thiểu 8 ký tự)</label>
            <input
              type="password"
              className={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Xác nhận mật khẩu mới</label>
            <input
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button
              type="submit"
              variant="primary"
              disabled={passwordSaving || !currentPassword || !newPassword}
            >
              <KeyRound size={16} /> Đổi mật khẩu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
