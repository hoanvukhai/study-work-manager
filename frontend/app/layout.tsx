import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

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
        <div className="app-container">
          <Sidebar />
          <div className="main-wrapper">
            <Header />
            <main className="content-container">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
