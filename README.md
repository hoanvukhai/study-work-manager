# study-work-manager

Đồ án tốt nghiệp — Xây dựng ứng dụng web quản lý học tập và công việc cá nhân (Personal Study & Work Management System).

---

## 1. Giới thiệu

Ứng dụng hướng tới người học và người làm việc độc lập (sinh viên, freelancer, người tự học), giải quyết bài toán phân mảnh thông tin bằng cách hợp nhất việc quản lý công việc, ghi chú, lịch trình và tri thức cá nhân trên một nền tảng duy nhất:

- **Không gian làm việc linh hoạt (Spaces):** Người dùng tự do định nghĩa các ngữ cảnh cá nhân (ví dụ: *Đồ án tốt nghiệp*, *Việc Freelance*, *Học Ngoại ngữ*...) thay vì bị ép buộc vào các danh mục tĩnh.
- **Mô hình Hạt nhân Đa hình (Hybrid Objects):** Thống nhất mọi dạng dữ liệu (Công việc - Task, Ghi chú - Note, Sự kiện - Event, Tài liệu - Reference) thành các đối tượng độc lập, có thuộc tính và vòng đời riêng biệt.
- **Cơ chế Gắn đa ngữ cảnh (Contextual Placement):** Một công việc hoặc ghi chú có thể hiển thị đồng thời ở nhiều Không gian khác nhau mà không bị nhân bản dữ liệu.
- **Mạng lưới liên kết tri thức (Bi-directional Relations):** Tạo liên kết chéo hai chiều giữa nhiệm vụ thực thi và các ghi chú, bài học liên quan.
- **Đa dạng chế độ hiển thị (Multi-views):** Danh sách tổng hợp (`📑 Tất cả`), Bảng việc Kanban kéo thả, Lịch thời gian Calendar, Bảng vẽ tư duy Canvas và Chế độ tập trung sâu (Zen Focus Mode).

---

## 2. Công nghệ sử dụng (Tech Stack)

- **Frontend:** Next.js 14 (App Router), TypeScript, Vanilla CSS / CSS Modules, Lucide React
- **Backend:** NestJS, TypeScript, Passport JWT, Bcrypt
- **Database & ORM:** PostgreSQL 16 (chạy container Docker), Prisma ORM
- **Xác thực & Bảo mật:** JWT (Access Token & Refresh Token)
- **Công cụ thiết kế & Sơ đồ:** Figma, draw.io

---

## 3. Cấu trúc thư mục

```text
study-work-manager/
├── README.md              # Giới thiệu tổng quan & Hướng dẫn khởi chạy
├── docker-compose.yml     # Khởi chạy PostgreSQL Container (Port 5435)
├── backend/               # Mã nguồn Backend (NestJS, Prisma ORM, Auth Module)
├── frontend/              # Mã nguồn Frontend (Next.js 14, Lucide Icons)
├── docs/                  # Hệ thống 12 tài liệu phân tích & thiết kế chuẩn hóa
│   ├── README.md          # Mục lục tài liệu & Bảng tiến độ
│   └── Workflow.md        # Quy tắc commit, Git Tag & Quy trình làm việc
├── design/                # Thiết kế UI/UX (Figma link, HTML mockups & exports)
│   ├── exports/           # 13 ảnh wireframe giao diện thực tế
│   └── theme/             # Các mẫu giao diện HTML/CSS
├── diagrams/              # Sơ đồ kỹ thuật hệ thống (.drawio)
│   └── exports/           # Ảnh xuất của Use Case, Activity, Architecture, ERD
├── meeting/               # Biên bản các buổi họp với GVHD
└── report/                # Bản nháp báo cáo tốt nghiệp
```

---

## 4. Tài liệu & Quy trình

- Chi tiết 12 tài liệu phân tích thiết kế chuẩn hóa: Xem tại [docs/README.md](docs/README.md).
- Quy tắc commit, quản lý phiên bản (Git Tag) và quy trình phát triển: Xem tại [docs/Workflow.md](docs/Workflow.md).

---

## 5. Hướng dẫn khởi chạy ứng dụng

### Bước 1: Khởi động Cơ sở dữ liệu (PostgreSQL)
```bash
# Chạy Docker daemon trước, sau đó khởi động database container
docker compose up -d
```

### Bước 2: Cài đặt và chạy Backend (NestJS)
```bash
cd backend
npm install
npx prisma generate
npm run start:dev
# Backend chạy tại: http://localhost:3001
```

### Bước 3: Cài đặt và chạy Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# Frontend chạy tại: http://localhost:3000
```
