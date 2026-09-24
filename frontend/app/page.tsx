'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  FileText, 
  Link as LinkIcon 
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner & Quick Capture Bar */}
      <div className="card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        backgroundColor: '#ffffff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Xin chào Hoàn 👋
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Chào mừng bạn trở lại không gian làm việc. Hôm nay bạn có 2 nhiệm vụ cần hoàn thành.
            </p>
          </div>
          <span className="badge badge-task" style={{ fontSize: '13px', padding: '4px 10px' }}>
            Hôm nay: Thứ Năm, 24/09/2026
          </span>
        </div>

        {/* Quick Capture Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--canvas-bg)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
        }}>
          <Sparkles size={18} color="#1a73e8" />
          <input 
            type="text" 
            placeholder="Gõ nhanh ý tưởng, ghi chú hoặc bài tập mới... Nhấn Enter để lưu vào Hộp nhận (Inbox)" 
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '14px',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1.8fr 1.2fr', 
        gap: '24px' 
      }}>
        {/* Left Column: Active Workspace & Urgent Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Hero Card: Context Resume */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={20} color="#1a73e8" />
                <span style={{ fontWeight: 600, fontSize: '16px' }}>Đang học tập dở dang</span>
              </div>
              <Link href="/spaces/thesis" style={{ fontSize: '13px', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Vào Không gian <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{
              padding: '14px',
              backgroundColor: 'var(--canvas-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-note">Ghi chú gần nhất</span>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Ghi chú góp ý của Thầy Cường</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Tập trung vào kiến trúc Hybrid Object và kiểm thử liên kết chéo giữa Note và Task...
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>Tiến độ Không gian "Đồ án tốt nghiệp"</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>65% hoàn thành (13/20 việc)</span>
            </div>
          </div>

          {/* Urgent Deadlines */}
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#d93025" />
              <span>Ưu tiên & Cận hạn (24h - 48h)</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Khởi tạo Prisma Schema và nạp dữ liệu mẫu 8 bảng</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Space: 🎓 Đồ án tốt nghiệp • <span style={{ color: '#1a73e8' }}>🔗 Gắn với: Ghi chú góp ý GVHD</span>
                    </div>
                  </div>
                </div>
                <span className="badge badge-urgent">Hôm nay</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" style={{ width: '16px', height: '16px', cursor: 'pointer' }} defaultChecked />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
                      Hoàn thiện bản thiết kế 22 API endpoints
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Space: 🎓 Đồ án tốt nghiệp
                    </div>
                  </div>
                </div>
                <span className="badge" style={{ backgroundColor: '#e6f4ea', color: '#137333' }}>Đã xong</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Today Schedule & Recent Materials */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Today Schedule */}
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#1a73e8" />
              <span>Lịch trình hôm nay</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '10px 12px',
                borderLeft: '3px solid #1a73e8',
                backgroundColor: 'var(--canvas-bg)',
                borderRadius: '0 6px 6px 0',
              }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>09:00 - 10:30</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Họp báo cáo tiến độ tuần với Thầy Cường</div>
              </div>

              <div style={{
                padding: '10px 12px',
                borderLeft: '3px solid #f59e0b',
                backgroundColor: 'var(--canvas-bg)',
                borderRadius: '0 6px 6px 0',
              }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>14:00 - 16:00</div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>Tự học NestJS Architecture & Prisma ORM</div>
              </div>
            </div>
          </div>

          {/* Quick Spaces overview */}
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px' }}>
              Không gian cá nhân
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/spaces/thesis" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎓</span>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Đồ án tốt nghiệp</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>4 đối tượng</span>
              </Link>

              <Link href="/spaces/freelance" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💼</span>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Việc Freelance</span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>0 đối tượng</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
