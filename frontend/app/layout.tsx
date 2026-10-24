import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { ReactQueryProvider } from '@/lib/query-provider';
import { ToastProvider } from '@/components/ui/Toast';

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
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ReactQueryProvider>
            <AuthProvider>
              <ToastProvider>{children}</ToastProvider>
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
