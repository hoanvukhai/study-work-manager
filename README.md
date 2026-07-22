# study-work-manager

Đồ án tốt nghiệp — Xây dựng ứng dụng web quản lý học tập và công việc cá nhân (Personal Study & Work Management System).

---

## 1. Giới thiệu

Ứng dụng giúp người dùng cá nhân (sinh viên, freelancer, người tự học) quản lý tập trung toàn bộ hoạt động học tập và công việc trên cùng một nền tảng:

- **Task**: Quản lý các đầu việc cần thực hiện, theo dõi trạng thái và thời hạn (deadline).
- **Learning**: Theo dõi các nội dung học tập, môn học, khóa học với tiến độ riêng.
- **Calendar**: Lịch trình cá nhân, tự động đồng bộ thời hạn từ Task và Learning.
- **Reference**: Lưu trữ tài liệu tham khảo, liên kết trực tiếp với từng Task hoặc Learning cụ thể.
- **Dashboard**: Màn hình tổng quan tập trung thông tin trong ngày.

---

## 2. Công nghệ sử dụng (Tech Stack)

- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS
- **Backend**: NestJS, TypeScript
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Xác thực**: JWT (Access Token & Refresh Token)
- **Công cụ quản lý & thiết kế**: Obsidian (Markdown), draw.io, Figma

---

## 3. Cấu trúc thư mục

```text
study-work-manager/
├── README.md              # Giới thiệu tổng quan & Hướng dẫn chạy
├── .gitignore
│
├── docs/                  # Tài liệu phân tích & thiết kế (12 tài liệu)
│   ├── README.md          # Mục lục tài liệu & Bảng tiến độ
│   └── Workflow.md        # Quy tắc commit, Git Tag & Quy trình làm việc
│
├── diagrams/              # File sơ đồ hệ thống (.drawio)
├── design/                # Link thiết kế giao diện Figma
├── report/                # Bản nháp báo cáo tốt nghiệp
├── meeting/               # Biên bản các buổi họp với GVHD
│
├── backend/               # Mã nguồn Backend (NestJS)
└── frontend/              # Mã nguồn Frontend (Next.js)
```

---

## 4. Tài liệu & Quy trình

- Chi tiết 12 tài liệu phân tích thiết kế và tiến độ thực hiện: Xem tại [docs/README.md](docs/README.md).
- Quy tắc commit, quản lý phiên bản (Git Tag) và quy trình phát triển: Xem tại [docs/Workflow.md](docs/Workflow.md).

---

## 5. Hướng dẫn chạy ứng dụng

*(Sẽ được cập nhật chi tiết sau khi khởi tạo dự án backend và frontend)*

```bash
# Chạy Backend (NestJS)
cd backend
npm install
npm run start:dev

# Chạy Frontend (Next.js)
cd frontend
npm install
npm run dev
```
