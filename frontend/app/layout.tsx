import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata = {
  title: 'Study & Work Manager — Hệ thống Quản lý Học tập & Công việc',
  description: 'Không gian làm việc và tích lũy tri thức cá nhân theo kiến trúc Hybrid Object',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
