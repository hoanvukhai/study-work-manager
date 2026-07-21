# 06_Database_Design.md — Thiết kế cơ sở dữ liệu

> **Tầng:** Design (Tầng 2 / 3)  
> **Phụ thuộc vào:** [05_Domain_Model.md](05_Domain_Model.md) — Domain Entities & Relations, [04_System_Architecture.md](04_System_Architecture.md) — Decision Log (PostgreSQL)  
> **Tài liệu tiếp theo:** [07_API_Design.md](07_API_Design.md)  
> **Trạng thái:** ⬜ Chưa bắt đầu  
> **Cập nhật lần cuối:** —

---

<!--
  HƯỚNG DẪN VIẾT FILE NÀY:
  
  Quy trình chuẩn:
  1. Vẽ ERD Logic (draw.io) — từ Domain Model → chuyển sang bảng DB
  2. Viết schema.prisma trong backend/prisma/
  3. Prisma ERD Generator tự sinh ERD Physical
  4. Viết Data Dictionary (từng field) ở đây
  
  ERD Logic: ../diagrams/06_ERD.drawio
  Prisma schema: ../backend/prisma/schema.prisma
-->

## 1. ERD mức Logic

> Ánh xạ từ Domain Model sang các bảng database. Tập trung vào quan hệ giữa bảng, chưa chi tiết kiểu dữ liệu.

*(Vẽ bằng draw.io, lưu tại `../diagrams/06_ERD.drawio`, export PNG vào `../diagrams/exports/erd-logic.png`)*

<!-- ![ERD Logic](../diagrams/exports/erd-logic.png) -->

---

## 2. ERD mức Physical

> Sinh tự động từ Prisma bằng `prisma-erd-generator` sau khi có `schema.prisma`.

```bash
# Cài đặt
npm install -D prisma-erd-generator @mermaid-js/mermaid-cli

# Thêm vào schema.prisma:
# generator erd {
#   provider = "prisma-erd-generator"
#   output   = "ERD.svg"
# }

# Generate
npx prisma generate
```

<!-- ![ERD Physical](../backend/prisma/ERD.svg) -->

---

## 3. Data Dictionary (Từ điển dữ liệu)

> Mỗi field đều phải có ý nghĩa rõ ràng. Đây là mục hội đồng thường hỏi.

### Bảng: `users`

| Column | Kiểu dữ liệu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `id` | UUID | NO | gen_random_uuid() | Khóa chính |
| `email` | VARCHAR(255) | NO | — | Email đăng nhập, UNIQUE |
| `password` | VARCHAR(255) | NO | — | Mật khẩu đã hash (bcrypt) |
| `name` | VARCHAR(100) | YES | NULL | Tên hiển thị |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Thời điểm tạo |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Thời điểm cập nhật gần nhất |

### Bảng: `tasks`

| Column | Kiểu dữ liệu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `id` | UUID | NO | gen_random_uuid() | Khóa chính |
| `user_id` | UUID | NO | — | FK → users.id |
| `title` | VARCHAR(255) | NO | — | Tiêu đề công việc |
| `description` | TEXT | YES | NULL | Mô tả chi tiết |
| `status` | ENUM | NO | `TODO` | Trạng thái: TODO / IN_PROGRESS / DONE / CANCELLED |
| `priority` | ENUM | YES | `MEDIUM` | Độ ưu tiên: LOW / MEDIUM / HIGH |
| `due_date` | TIMESTAMPTZ | YES | NULL | Deadline (NULL = không có deadline) |
| `created_at` | TIMESTAMPTZ | NO | NOW() | |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | |

### Bảng: `learning_items`

| Column | Kiểu dữ liệu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `id` | UUID | NO | gen_random_uuid() | Khóa chính |
| `user_id` | UUID | NO | — | FK → users.id |
| `title` | VARCHAR(255) | NO | — | Tiêu đề nội dung học |
| `description` | TEXT | YES | NULL | Mô tả |
| `status` | ENUM | NO | `NOT_STARTED` | NOT_STARTED / IN_PROGRESS / COMPLETED |
| `progress` | INT | NO | 0 | Tiến độ 0-100 (%) |
| `due_date` | TIMESTAMPTZ | YES | NULL | Deadline học |
| `created_at` | TIMESTAMPTZ | NO | NOW() | |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | |

### Bảng: `calendar_events`

| Column | Kiểu dữ liệu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `id` | UUID | NO | gen_random_uuid() | Khóa chính |
| `user_id` | UUID | NO | — | FK → users.id |
| `title` | VARCHAR(255) | NO | — | Tên sự kiện |
| `start_time` | TIMESTAMPTZ | NO | — | Thời gian bắt đầu |
| `end_time` | TIMESTAMPTZ | YES | NULL | Thời gian kết thúc |
| `task_id` | UUID | YES | NULL | FK → tasks.id (nếu liên kết task) |
| `learning_id` | UUID | YES | NULL | FK → learning_items.id (nếu liên kết learning) |
| `created_at` | TIMESTAMPTZ | NO | NOW() | |

### Bảng: `tags`

| Column | Kiểu dữ liệu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `id` | UUID | NO | gen_random_uuid() | Khóa chính |
| `user_id` | UUID | NO | — | FK → users.id |
| `name` | VARCHAR(50) | NO | — | Tên tag |
| `color` | VARCHAR(7) | YES | `#6366f1` | Màu hex để hiển thị |

### Bảng: `task_tags` (join table)

| Column | Kiểu dữ liệu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `task_id` | UUID | NO | — | FK → tasks.id |
| `tag_id` | UUID | NO | — | FK → tags.id |

*(PK = (task_id, tag_id))*

### Bảng: `references`

| Column | Kiểu dữ liệu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `id` | UUID | NO | gen_random_uuid() | Khóa chính |
| `user_id` | UUID | NO | — | FK → users.id |
| `title` | VARCHAR(255) | NO | — | Tiêu đề |
| `url` | TEXT | YES | NULL | URL tài liệu |
| `note` | TEXT | YES | NULL | Ghi chú thêm |
| `task_id` | UUID | YES | NULL | FK → tasks.id |
| `learning_id` | UUID | YES | NULL | FK → learning_items.id |
| `created_at` | TIMESTAMPTZ | NO | NOW() | |

### Bảng: `notifications`

| Column | Kiểu dữ liệu | Nullable | Default | Ý nghĩa |
|---|---|---|---|---|
| `id` | UUID | NO | gen_random_uuid() | Khóa chính |
| `user_id` | UUID | NO | — | FK → users.id |
| `message` | TEXT | NO | — | Nội dung thông báo |
| `is_read` | BOOLEAN | NO | false | Đã đọc chưa |
| `task_id` | UUID | YES | NULL | Task liên quan (nếu có) |
| `learning_id` | UUID | YES | NULL | Learning liên quan (nếu có) |
| `created_at` | TIMESTAMPTZ | NO | NOW() | |

---

## 4. Prisma Schema (khung ban đầu)

> File đầy đủ tại `../backend/prisma/schema.prisma`

```prisma
// Xem backend/prisma/schema.prisma để có file đầy đủ nhất
// Đây chỉ là snapshot để tham chiếu trong tài liệu

model User {
  id         String   @id @default(uuid())
  email      String   @unique
  password   String
  name       String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  tasks           Task[]
  learningItems   LearningItem[]
  calendarEvents  CalendarEvent[]
  tags            Tag[]
  references      Reference[]
  notifications   Notification[]
}

// ... (xem schema.prisma đầy đủ)
```

---

*Tài liệu tiếp theo trong chuỗi: [07_API_Design.md](07_API_Design.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
