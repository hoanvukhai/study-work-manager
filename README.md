# study-work-manager

Đây là đồ án tốt nghiệp của mình — xây dựng một ứng dụng web giúp quản lý công việc và việc học trong cùng một chỗ.

Ý tưởng xuất phát từ vấn đề thực tế: mình đang phải dùng Google Calendar để ghi lịch, Google Drive để lưu tài liệu, rồi lại mở thêm Trello để theo dõi task — nhưng tất cả thông tin liên quan đến một đầu việc cứ nằm rải rác ở các nơi khác nhau, rất bất tiện. Ứng dụng này muốn gộp **Task, Learning, Calendar và Reference** vào một hệ thống duy nhất, phục vụ cho sinh viên, freelancer hoặc người tự học.

---

## Tech Stack

| | |
|---|---|
| Frontend | Next.js 14 + TypeScript + TailwindCSS |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (Access Token + Refresh Token) |

---

## Cấu trúc repo

```
study-work-manager/
│
├── docs/          # Tài liệu phân tích & thiết kế (12 file)
├── diagrams/      # Sơ đồ vẽ bằng draw.io
├── design/        # Link Figma (không commit file .fig)
├── report/        # Bản nháp báo cáo tốt nghiệp
├── meeting/       # Biên bản họp với GVHD
│
├── backend/       # NestJS — sẽ khởi tạo sau khi xong thiết kế
└── frontend/      # Next.js — tương tự
```

Tài liệu phân tích và thiết kế nằm trong `docs/` — xem [docs/README.md](docs/README.md) để biết trạng thái từng phần.

---

## Thứ tự phát triển

Mình làm theo thứ tự cố định: phân tích xong mới thiết kế, thiết kế xong mới code. Không nhảy bước.

```
Phân tích (Research → Requirement → Use Case)
    ↓
Thiết kế (Kiến trúc → Database → API → UI)
    ↓
Code (Backend → Frontend)
    ↓
Kiểm thử → Deploy → Viết báo cáo
```

Kế hoạch khoảng 22 tuần — điều chỉnh tùy theo lịch bảo vệ thực tế.

---

## Cách chạy

*(Cập nhật sau khi khởi tạo backend và frontend)*

```bash
# Backend
cd backend && npm install && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev
```

---

## Commit convention

Mình dùng prefix để dễ tìm lại lịch sử:

```
[docs]    — viết hoặc sửa tài liệu
[feat]    — thêm tính năng mới
[fix]     — sửa bug
[diagram] — cập nhật sơ đồ draw.io
[report]  — viết báo cáo
[meeting] — thêm biên bản họp
[chore]   — cấu hình, setup
```

---

<!-- BẠN ĐIỀN: tên trường, tên sinh viên, GVHD, năm học -->
*Đồ án tốt nghiệp — [Trường] — [Năm học]*  
*Sinh viên: [Tên bạn] · GVHD: [Tên thầy/cô]*
