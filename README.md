# study-work-manager

Đồ án tốt nghiệp — **Hệ thống quản lý học tập và công việc cá nhân** (Personal Study & Work Management System).

> Việc cần làm, ghi chú, sự kiện và tài liệu là **cùng một loại "thẻ"** nên hệ thống kết hợp được những thứ vốn nằm ở ba ứng dụng khác nhau: *lập kế hoạch* (Todoist), *ôn tập* (Anki), *mạng tri thức* (Obsidian).

---

## 1. Giới thiệu

Ứng dụng hướng tới người học và người làm việc độc lập (sinh viên, freelancer, người tự học), giải quyết bài toán thông tin bị phân mảnh qua nhiều ứng dụng.

**Nền tảng**
- **Không gian (Space):** người dùng tự tạo theo chủ đề (Đồ án, Môn học, Freelance...), có mục tiêu, hạn chót, tiến độ, ghim, sắp xếp, và tự bật/tắt công cụ (Kanban, Lịch, Tiến độ). Có mẫu dựng sẵn.
- **Mô hình Hạt nhân Đa hình (Object):** Task, Note (Markdown), Event, Reference là các thực thể độc lập có vòng đời riêng (Hoạt động → Lưu trữ → Thùng rác → Xoá vĩnh viễn).
- **Gán đa ngữ cảnh:** một mục nằm ở nhiều Không gian cùng lúc mà không nhân bản dữ liệu.
- **Nhiều góc nhìn:** danh sách, lưới, Kanban, Lịch tuần/tháng, Hộp nhận, bản đồ tri thức.

**Ba trụ — "Một Object, ba góc nhìn"**
- **Kế hoạch:** việc phụ thuộc nhau (cấm vòng), việc con, ước lượng thời gian, việc lặp lại, gợi ý *"Hôm nay làm gì?"* kèm lý do, cảnh báo quá tải và cảnh báo khi dời hạn.
- **Học tập:** thẻ hỏi–đáp viết ngay trong ghi chú (`Câu hỏi :: Trả lời`), ôn tập ngắt quãng **SM-2**, ưu tiên ôn ghi chú liên quan việc sắp đến hạn, Pomodoro, thống kê và chuỗi ngày học.
- **Tri thức:** gõ `[[Tiêu đề]]` để tự liên kết, backlink, **bản đồ tri thức** (đồ thị tương tác).

**Tiện ích:** thông báo (sắp hạn, quá hạn, sự kiện, bản tin sáng, mở khoá, ôn tập) có giờ yên lặng; lịch `.ics` cho Google Calendar; báo cáo tuần; quên mật khẩu qua email; xuất dữ liệu cá nhân; chế độ sáng/tối; dùng được trên điện thoại.

**Quản trị:** khu vực Admin quản lý tài khoản và xem thống kê tổng hợp — **không đọc được nội dung cá nhân** của người dùng (có test chứng minh).

---

## 2. Công nghệ sử dụng

- **Frontend:** Next.js 14 (App Router), TypeScript, TanStack Query, CSS Modules, react-markdown
- **Backend:** NestJS 10, TypeScript, Passport JWT, Bcrypt, `@nestjs/schedule`, `@nestjs/throttler`, helmet, Swagger
- **CSDL:** PostgreSQL 16 (Docker), Prisma ORM 5 với **migration**
- **Kiểm thử:** Jest + Supertest — 235 test tự động chạy trên PostgreSQL thật
- **Đóng gói:** Docker / Docker Compose
- **Thiết kế & sơ đồ:** Figma, draw.io

---

## 3. Cấu trúc thư mục

```text
study-work-manager/
├── README.md
├── docker-compose.yml        # PostgreSQL cho phát triển (cổng 5435)
├── docker-compose.prod.yml   # Chạy cả hệ thống bằng Docker (CSDL + API + giao diện)
├── backend/                  # NestJS + Prisma (src/, prisma/migrations/, test/)
├── frontend/                 # Next.js
├── docs/                     # 13 tài liệu phân tích & thiết kế (01–13)
├── plan/                     # Sổ tay làm việc: hiện trạng, quyết định, lộ trình, nhật ký
├── progress/                 # Tóm tắt tiến độ theo giai đoạn
├── design/  diagrams/        # Wireframe, sơ đồ draw.io
├── meeting/                  # Biên bản họp GVHD
└── report/                   # Bản nháp báo cáo tốt nghiệp
```

---

## 4. Tài liệu

| Cần xem | Ở đâu |
|---|---|
| Mục lục và liên kết 13 tài liệu | [docs/README.md](docs/README.md) |
| Kiến trúc và lý do chọn công nghệ | [docs/04_System_Architecture.md](docs/04_System_Architecture.md) |
| CSDL (sinh tự động từ schema) | [docs/06_Database_Design.md](docs/06_Database_Design.md) |
| API (sinh tự động từ controller) | [docs/07_API_Design.md](docs/07_API_Design.md) hoặc Swagger `/api/docs` |
| Kiểm thử | [docs/10_Testing.md](docs/10_Testing.md) |
| Triển khai | [docs/11_Deployment.md](docs/11_Deployment.md) |
| Quy tắc commit và quy trình | [docs/Workflow.md](docs/Workflow.md) |
| Quyết định thiết kế, lộ trình, nhật ký | [plan/](plan/README.md) |

---

## 5. Chạy ứng dụng (phát triển)

```bash
# 1) CSDL
docker compose up -d

# 2) Backend  → http://localhost:3001/api/v1   (Swagger: /api/docs)
cd backend
cp .env.example .env            # bắt buộc đặt JWT_SECRET
npm install
npx prisma migrate reset --force   # áp migration + nạp dữ liệu mẫu (CHỈ cho phát triển)
npm run start:dev

# 3) Frontend  → http://localhost:3000
cd ../frontend
npm install
npm run dev
```

Tài khoản mẫu (chỉ môi trường phát triển): `demo@example.com / Password123!` và quản trị `admin@example.com / Admin12345!`.

## 6. Kiểm thử

```bash
cd backend
npm test            # unit test (82)
npm run test:e2e    # test API trên PostgreSQL thật (153) — cần: docker compose up -d
npx tsc --noEmit    # kiểm tra kiểu (cả backend và frontend)
```

## 7. Chạy bằng Docker (đóng gói)

```bash
cp .env.prod.example .env       # đổi POSTGRES_PASSWORD, JWT_SECRET
docker compose -f docker-compose.prod.yml up -d --build
```

Chi tiết biến môi trường, tạo Admin đầu tiên và lưu ý khi đưa lên mạng: [docs/11_Deployment.md](docs/11_Deployment.md).
