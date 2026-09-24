# 13_Cam_Nang_Thiet_Lap_Va_Kien_Truc_Chi_Tiet.md — Cẩm nang Kỹ thuật: Khởi tạo Hệ thống, Cơ sở dữ liệu & Cấu trúc Dự án

> **Tầng:** Engineering Handbook & Scaffolding Log (Tầng Kỹ thuật Thực hành)  
> **Dự án:** Hệ thống Quản lý Học tập và Công việc Cá nhân (*Study & Work Manager*)  
> **Tác giả:** Vũ Khải Hoàn  
> **Trạng thái:** Hoàn thành thiết lập nền tảng — Sẵn sàng lập trình chức năng  
> **Commit tham chiếu:** `66dd079` ([GitHub Repository](https://github.com/hoanvukhai/study-work-manager.git))  
> **Mục tiêu tài liệu:** Ghi lại chi tiết, minh bạch toàn bộ các bước thiết lập kỹ thuật từ A-Z, giải thích cặn kẽ từng câu lệnh, phân tích nguyên nhân - giải pháp của các quyết định kiến trúc, giúp lập trình viên vừa học, vừa hiểu sâu bản chất hệ thống.

---

## MỤC LỤC

1. [Bối cảnh & Triết lý Kiến trúc Hệ thống](#1-bối-cảnh--triết-lý-kiến-trúc-hệ-thống)
2. [Hạ tầng Cơ sở Dữ liệu & Ảo hóa với Docker](#2-hạ-tầng-cơ-sở-dữ-liệu--ảo-hóa-với-docker)
3. [Thiết kế Cơ sở Dữ liệu Chuẩn hóa 8 Bảng & Prisma ORM](#3-thiết-kế-cơ-sở-dữ-liệu-chuẩn-hóa-8-bảng--prisma-orm)
4. [Kịch bản Nạp Dữ Liệu Mẫu (Database Seeding)](#4-kịch-bản-nạp-dữ-liệu-mẫu-database-seeding)
5. [Khung Mã Nguồn Backend (NestJS Scaffolding)](#5-khung-mã-nguồn-backend-nestjs-scaffolding)
6. [Khung Giao Diện Frontend (Next.js 14 App Router)](#6-khung-giao-diện-frontend-nextjs-14-app-router)
7. [Quản lý Phiên bản Git & Kiểm soát Mã nguồn](#7-quản-lý-phiên-bản-git--kiểm-soát-mã-nguồn)
8. [Cẩm nang Tra cứu Lệnh Thực hành (Command Cheat Sheet)](#8-cẩm-nang-tra-cứu-lệnh-thực-hành-command-cheat-sheet)
9. [Lộ trình Tuần Kế tiếp: Bắt đầu Viết Code Chức năng](#9-lộ-trình-tuần-kế-tiếp-bắt-đầu-viết-code-chức-năng)

---

## 1. BỐI CẢNH & TRIẾT LÝ KIẾN TRÚC HỆ THỐNG

### 1.1. Vấn đề của cách tiếp cận cũ (Phân chia 50/50 cứng nhắc)
Trong các giải pháp ban đầu, hệ thống thường cố gắng tách biệt rạch ròi người dùng thành 2 nửa màn hình hoặc 2 chế độ riêng biệt: **"Học tập"** và **"Công việc"**. Tuy nhiên, trong thực tế cuộc sống của sinh viên và người đi làm trẻ:
- Một công việc như **"Làm Đồ án tốt nghiệp"** vừa là nhiệm vụ học tập trên trường, vừa là một dự án phần mềm chuyên nghiệp.
- Nếu tách thành 2 phân hệ độc lập, mã nguồn bị nhân đôi (2 bảng Task, 2 màn hình Kanban, 2 logic lưu trữ), người dùng bị ức chế vì phải chuyển đổi qua lại giữa 2 chế độ.

### 1.2. Triết lý mới: Không gian Tự do (Unified Spaces) & Đối tượng Đa hình (Polymorphic Objects)
Hệ thống chuyển dịch sang mô hình của các phần mềm quản lý tri thức và năng suất hàng đầu thế giới (như *Notion, Obsidian, Capacities, Linear*):
1. **Không gian làm việc (Spaces):** Người dùng tự định nghĩa các ngữ cảnh cuộc sống của mình (ví dụ: *🎓 Đồ án tốt nghiệp*, *💼 Việc Freelance*, *🇬🇧 Học IELTS*, *🏋️ Sức khỏe*).
2. **Đối tượng hạt nhân đa hình (Objects):** Mọi đơn vị thông tin trong hệ thống đều là một `Object` mang một kiểu (`type`):
   - `TASK`: Việc cần làm, có trạng thái (`TODO`, `IN_PROGRESS`, `DONE`), độ ưu tiên, hạn chót (`due_date`).
   - `NOTE`: Ý tưởng, biên bản cuộc họp, bài học, kiến thức dạng văn bản Markdown.
   - `EVENT`: Cuộc họp, buổi bảo vệ, lịch học có mốc thời gian cụ thể.
   - `REFERENCE`: Đường dẫn tài liệu, bài báo nghiên cứu, video tham khảo.
3. **Gắn đa ngữ cảnh (Contextual Placement):** Một Object có thể xuất hiện trong nhiều Không gian khác nhau qua bảng liên kết trung gian `space_objects` mà không bị sao chép dữ liệu.
4. **Mạng lưới tri thức (Object Relations):** Các Object có thể liên kết chéo 2 chiều (ví dụ: Một `TASK` phụ thuộc vào một `NOTE` chứa tài liệu hướng dẫn của giảng viên).

### 1.3. Triết lý Giao diện: Google Neutral Design
Thay vì sử dụng các phong cách màu mè, gradient đậm hoặc Glassmorphism bóng bẩy nhưng gây mỏi mắt sau 30 phút làm việc, hệ thống áp dụng triết lý thiết kế tối giản của Google:
- **Màu nền trung tính dịu mắt:** Nền trang xám nhạt (`#f8f9fa`), bề mặt thẻ nội dung trắng tinh (`#ffffff`), viền mỏng 1px (`#dadce0`).
- **Màu nhấn thương hiệu chuẩn mực:** Google Blue (`#1a73e8`) cho các hành động chính, màu pastel cho các nhãn phân loại (Xanh lá `#e6f4ea`, Cam `#fef7e0`, Đỏ `#fce8e6`).
- **Khoảng thở thị giác (Visual Whitespace):** Tạo không gian thoáng đãng, giúp người dùng tập trung tối đa vào việc học sâu (Deep Work).

---

## 2. HẠ TẦNG CƠ SỞ DỮ LIỆU & ẢO HÓA VỚI DOCKER

### 2.1. Phân tích hiện trạng môi trường máy tính
Khi khảo sát môi trường Windows của máy phát triển, phát hiện cổng mạng mặc định của PostgreSQL (`5432`) đã bị chiếm giữ bởi dịch vụ **PostgreSQL 18** cài trực tiếp trên máy:
```powershell
# Kiểm tra tiến trình đang lắng nghe cổng 5432
Get-NetTCPConnection -LocalPort 5432
# Kết quả: PID 10288 đang chiếm giữ bởi postgresql-x64-18
```
Nếu cố tình chạy database mới trên cổng 5432, hệ thống sẽ báo lỗi `Error: listen EADDRINUSE: address already in use 0.0.0.0:5432`.

### 2.2. Giải pháp: Container hóa độc lập bằng Docker Compose
Để tránh xung đột, đảm bảo tính đóng gói và có thể chạy nhất quán trên mọi máy tính (kể cả khi nộp đồ án cho thầy cô hoặc deploy lên server), ta cấu hình một container Docker chạy **PostgreSQL 16 Alpine** trên cổng chuyển tiếp **`5435:5432`**.

### 2.3. Chi tiết file cấu hình `docker-compose.yml`
File được đặt tại thư mục gốc của dự án:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: study_work_postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: study_work_db
    ports:
      - "5435:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d study_work_db"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

#### Giải thích kỹ thuật từng tham số:
* `image: postgres:16-alpine`: Sử dụng hệ điều hành Alpine Linux siêu nhẹ (dung lượng chỉ ~80MB thay vì ~400MB của bản Debian tiêu chuẩn), khởi động chỉ trong 1-2 giây.
* `container_name: study_work_postgres`: Đặt tên tường minh để dễ dàng quản lý qua CLI hoặc Docker Desktop.
* `environment`:
  * `POSTGRES_USER: postgres`: Tài khoản quản trị CSDL.
  * `POSTGRES_PASSWORD: postgrespassword`: Mật khẩu kết nối.
  * `POSTGRES_DB: study_work_db`: Tên cơ sở dữ liệu sẽ tự động tạo ngay khi container khởi động lần đầu.
* `ports: - "5435:5432"`: **Host Port 5435 -> Container Port 5432**. Các ứng dụng bên ngoài (NestJS, DBeaver, psql) sẽ kết nối tới `localhost:5435`.
* `volumes: - postgres_data:/var/lib/postgresql/data`: Dữ liệu được lưu trữ bền vững trong Docker Named Volume. Khi container bị dừng hoặc khởi động lại, dữ liệu CSDL hoàn toàn không bị mất.
* `healthcheck`: Kiểm tra tính sẵn sàng bằng lệnh `pg_isready` mỗi 5 giây để đảm bảo container đã nạp xong CSDL trước khi ứng dụng kết nối tới.

### 2.4. Các câu lệnh quản trị Docker thường dùng:
```powershell
# 1. Khởi động PostgreSQL ở chế độ chạy ngầm (-d = detached)
docker compose up -d

# 2. Kiểm tra danh sách container và cổng đang mở
docker ps

# 3. Xem nhật ký hoạt động (logs) của CSDL
docker logs study_work_postgres -f

# 4. Tạm dừng container
docker compose stop

# 5. Dừng và xóa container (Dữ liệu trong volume postgres_data vẫn được giữ nguyên)
docker compose down
```

---

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU CHUẨN HÓA 8 BẢNG & PRISMA ORM

### 3.1. Cấu hình biến môi trường kết nối (`backend/.env`)
Trong thư mục `backend/`, tạo file `.env` chứa chuỗi kết nối trực tiếp đến container Docker:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5435/study_work_db?schema=public"
JWT_SECRET="super-secret-key-datn-study-work-manager-2026"
JWT_EXPIRES_IN="7d"
```

### 3.2. Cấu trúc 8 bảng trong file `backend/prisma/schema.prisma`
Prisma đóng vai trò là Object-Relational Mapping (ORM), giúp ánh xạ các bảng CSDL quan hệ sang các đối tượng TypeScript có kiểu dữ liệu an toàn (Type-safe).

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. Enum nghiệp vụ
enum ObjectType {
  TASK
  NOTE
  EVENT
  REFERENCE
}

enum ObjectStatus {
  TODO
  IN_PROGRESS
  DONE
  ARCHIVED
}

enum ObjectPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum LifecycleState {
  INBOX
  ACTIVE
  SOMEDAY
  ARCHIVED
  TRASH
}

enum RelationType {
  DEPENDS_ON
  RELATES_TO
  PARENT_OF
  CHILD_OF
  DUPLICATES
}

// 2. Bảng Users
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String         @map("password_hash")
  fullName      String         @map("full_name")
  avatarUrl     String?        @map("avatar_url")
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")

  spaces        Space[]
  objects       Object[]
  tags          Tag[]
  notifications Notification[]

  @@map("users")
}

// 3. Bảng Spaces
model Space {
  id          String         @id @default(uuid())
  userId      String         @map("user_id")
  name        String
  description String?
  icon        String?        @default("📁")
  color       String?        @default("#1a73e8")
  isArchived  Boolean        @default(false) @map("is_archived")
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime       @updatedAt @map("updated_at")

  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  objects     SpaceObject[]

  @@map("spaces")
}

// 4. Bảng Objects (Hạt nhân đa hình)
model Object {
  id          String         @id @default(uuid())
  userId      String         @map("user_id")
  type        ObjectType
  title       String
  description String?
  status      ObjectStatus   @default(TODO)
  priority    ObjectPriority @default(MEDIUM)
  lifecycle   LifecycleState @default(ACTIVE)
  dueDate     DateTime?      @map("due_date")
  url         String?
  metadata    Json?          @default("{}")
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime       @updatedAt @map("updated_at")

  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  spaces      SpaceObject[]
  fromRelations ObjectRelation[] @relation("FromRelations")
  toRelations   ObjectRelation[] @relation("ToRelations")
  tags        ObjectTag[]
  notifications Notification[]

  @@map("objects")
}

// 5. Bảng SpaceObject (Gán đa ngữ cảnh N:M)
model SpaceObject {
  id        String   @id @default(uuid())
  spaceId   String   @map("space_id")
  objectId  String   @map("object_id")
  position  Int      @default(0)
  isPinned  Boolean  @default(false) @map("is_pinned")
  addedAt   DateTime @default(now()) @map("added_at")

  space     Space    @relation(fields: [spaceId], references: [id], onDelete: Cascade)
  object    Object   @relation(fields: [objectId], references: [id], onDelete: Cascade)

  @@unique([spaceId, objectId])
  @@map("space_objects")
}

// 6. Bảng ObjectRelation (Mạng lưới liên kết 2 chiều)
model ObjectRelation {
  id           String       @id @default(uuid())
  fromObjectId String       @map("from_object_id")
  toObjectId   String       @map("to_object_id")
  relationType RelationType @map("relation_type")
  createdAt    DateTime     @default(now()) @map("created_at")

  fromObject   Object       @relation("FromRelations", fields: [fromObjectId], references: [id], onDelete: Cascade)
  toObject     Object       @relation("ToRelations", fields: [toObjectId], references: [id], onDelete: Cascade)

  @@unique([fromObjectId, toObjectId, relationType])
  @@map("object_relations")
}

// 7. Bảng Tags & 8. ObjectTag
model Tag {
  id        String      @id @default(uuid())
  userId    String      @map("user_id")
  name      String
  color     String?     @default("#3b82f6")
  createdAt DateTime    @default(now()) @map("created_at")

  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  objects   ObjectTag[]

  @@unique([userId, name])
  @@map("tags")
}

model ObjectTag {
  objectId String @map("object_id")
  tagId    String @map("tag_id")

  object   Object @relation(fields: [objectId], references: [id], onDelete: Cascade)
  tag      Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([objectId, tagId])
  @@map("object_tags")
}

// 9. Bảng Notifications
model Notification {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  objectId  String?  @map("object_id")
  title     String
  message   String
  isRead    Boolean  @default(false) @map("is_read")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  object    Object?  @relation(fields: [objectId], references: [id], onDelete: SetNull)

  @@map("notifications")
}
```

### 3.3. Lệnh đồng bộ schema lên PostgreSQL:
Tại thư mục `backend/`, thực thi lệnh sau:
```powershell
npx -y prisma@5.10.2 db push
```
* **Ý nghĩa:** Lệnh `db push` sẽ đối chiếu trực tiếp schema Prisma với CSDL PostgreSQL trên Docker (cổng 5435), tự động khởi tạo 8 bảng và các kiểu ENUM một cách nhanh chóng mà không cần sinh file lịch sử migration phức tạp trong giai đoạn khởi tạo ban đầu.

---

## 4. KỊCH BẢN NẠP DỮ LIỆU MẪU (DATABASE SEEDING)

### 4.1. Tại sao cần Seeding ngay khi dựng khung?
Khi phát triển phần mềm theo nhóm hoặc làm đồ án tốt nghiệp:
1. **Kiểm tra tính toàn vẹn (Integrity Check):** Đảm bảo các ràng buộc khóa chính (`UUID`), khóa ngoại (`FOREIGN KEY ON DELETE CASCADE`), chỉ mục duy nhất (`UNIQUE`) đều hoạt động đúng.
2. **Sẵn sàng giao diện:** Khi bật Frontend lên, các bảng Kanban, biểu đồ, danh sách đều có sẵn dữ liệu hiển thị trực quan ngay, không bị màn hình trắng trơn.

### 4.2. Chi tiết kịch bản `backend/prisma/seed.sql`
```sql
-- 1. Thêm người dùng mẫu
INSERT INTO users (id, email, password_hash, full_name, avatar_url, created_at, updated_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'hoan@example.com',
  '$2b$10$abcdefghijklmnopqrstuv',
  'Vũ Khải Hoàn',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoan',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 2. Thêm Không gian mẫu (Spaces)
INSERT INTO spaces (id, user_id, name, description, icon, color, is_archived, created_at, updated_at)
VALUES
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Đồ án tốt nghiệp', 'Hệ thống Quản lý Học tập và Công việc Cá nhân', '🎓', '#1a73e8', false, NOW(), NOW()),
  ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Việc Freelance', 'Các dự án nhận thêm ngoài giờ', '💼', '#f59e0b', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Thêm các Đối tượng mẫu đa hình (Objects)
INSERT INTO objects (id, user_id, type, title, description, status, priority, lifecycle, due_date, url, metadata, created_at, updated_at)
VALUES
  (
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'NOTE',
    'Ghi chú góp ý của Thầy Cường',
    '- Tập trung vào kiến trúc Hybrid Object
- Chú ý liên kết chéo giữa Note và Task
- Giao diện tối giản theo chuẩn Google',
    'TODO', 'HIGH', 'ACTIVE', NULL, NULL, '{}', NOW(), NOW()
  ),
  (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'TASK',
    'Hoàn thiện bản thiết kế 22 API endpoints',
    'Đặc tả chi tiết Request/Response cho module Object và Relation',
    'DONE', 'HIGH', 'ACTIVE', NOW() + INTERVAL '2 days', NULL, '{}', NOW(), NOW()
  ),
  (
    'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'TASK',
    'Khởi tạo Prisma Schema và nạp dữ liệu mẫu 8 bảng',
    'Cài đặt Docker PostgreSQL cổng 5435 và kiểm tra kết nối',
    'IN_PROGRESS', 'URGENT', 'ACTIVE', NOW() + INTERVAL '1 day', NULL, '{}', NOW(), NOW()
  ),
  (
    'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'REFERENCE',
    'NestJS & Prisma Documentation',
    'Tài liệu tham khảo công nghệ chính thức',
    'TODO', 'MEDIUM', 'ACTIVE', NULL, 'https://docs.nestjs.com/recipes/prisma', '{}', NOW(), NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Gán đối tượng vào Không gian (SpaceObjects)
INSERT INTO space_objects (id, space_id, object_id, position, is_pinned, added_at)
VALUES
  (gen_random_uuid(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 0, true, NOW()),
  (gen_random_uuid(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 1, false, NOW()),
  (gen_random_uuid(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 2, true, NOW()),
  (gen_random_uuid(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 3, false, NOW())
ON CONFLICT (space_id, object_id) DO NOTHING;

-- 5. Tạo liên kết chéo 2 chiều (ObjectRelations)
INSERT INTO object_relations (id, from_object_id, to_object_id, relation_type, created_at)
VALUES (
  gen_random_uuid(),
  'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'DEPENDS_ON',
  NOW()
) ON CONFLICT (from_object_id, to_object_id, relation_type) DO NOTHING;

-- 6. Tạo Nhãn và gắn nhãn (Tags & ObjectTags)
INSERT INTO tags (id, user_id, name, color, created_at)
VALUES ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'KiếnTrúc', '#3b82f6', NOW())
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO object_tags (object_id, tag_id)
VALUES ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a88')
ON CONFLICT (object_id, tag_id) DO NOTHING;

-- 7. Tạo Thông báo nhắc việc (Notifications)
INSERT INTO notifications (id, user_id, object_id, title, message, is_read, created_at)
VALUES (
  gen_random_uuid(),
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  'Nhắc nhở hạn chót',
  'Nhiệm vụ "Khởi tạo Prisma Schema" cần hoàn thành trong hôm nay.',
  false,
  NOW()
);
```

### 4.3. Câu lệnh thực thi Seed qua `psql`:
```powershell
$env:PGPASSWORD = "postgrespassword"
& "F:\PostgreSQL8in\psql.exe" -U postgres -h 127.0.0.1 -p 5435 -d study_work_db -f backend/prisma/seed.sql
```

### 4.4. Kiểm tra đếm số dòng dữ liệu thực tế trong cả 8 bảng:
```powershell
$env:PGPASSWORD = "postgrespassword"
& "F:\PostgreSQL8in\psql.exe" -U postgres -h 127.0.0.1 -p 5435 -d study_work_db -c "
SELECT 'users' as tbl, count(*) FROM users UNION ALL
SELECT 'spaces', count(*) FROM spaces UNION ALL
SELECT 'objects', count(*) FROM objects UNION ALL
SELECT 'space_objects', count(*) FROM space_objects UNION ALL
SELECT 'object_relations', count(*) FROM object_relations UNION ALL
SELECT 'tags', count(*) FROM tags UNION ALL
SELECT 'object_tags', count(*) FROM object_tags UNION ALL
SELECT 'notifications', count(*) FROM notifications;
"
```
**Kết quả hiển thị chính xác:**
```
       tbl        | count 
------------------+-------
 users            |     1
 spaces           |     2
 objects          |     4
 space_objects    |     4
 object_relations |     1
 tags             |     1
 object_tags      |     1
 notifications    |     1
```

---

## 5. KHUNG MÃ NGUỒN BACKEND (NESTJS SCAFFOLDING)

### 5.1. Khởi tạo cấu hình cốt lõi
* `backend/package.json`: Khai báo các thư viện nền tảng:
  - `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`: Bộ khung NestJS.
  - `@prisma/client`: Client truy vấn CSDL có sinh mã tự động.
  - `class-validator`, `class-transformer`: Kiểm tra dữ liệu đầu vào (DTO validation).
  - `bcrypt`, `@nestjs/jwt`, `@nestjs/passport`: Phục vụ module bảo mật Auth.
* `backend/tsconfig.json`: Thiết lập TypeScript hỗ trợ Decorators và metadata (`experimentalDecorators: true`, `emitDecoratorMetadata: true`).
* `backend/nest-cli.json`: Tệp định cấu hình CLI của NestJS.

### 5.2. File khởi động chính (`backend/src/main.ts`)
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // 1. Tiền tố toàn cục cho mọi API: /api/v1/...
  app.setGlobalPrefix('api/v1');

  // 2. Bật chia sẻ tài nguyên nguồn gốc chéo (CORS) cho Frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Backend is running at: http://localhost:${port}/api/v1`);
}
bootstrap();
```

### 5.3. Service kết nối CSDL toàn cục (`backend/src/prisma/`)
Để không phải khởi tạo lại kết nối CSDL ở từng module (gây quá tải Connection Pool), ta xây dựng một `PrismaService` dùng chung kế thừa từ `PrismaClient`:
* `backend/src/prisma/prisma.service.ts`:
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```
* `backend/src/prisma/prisma.module.ts`: Khai báo decorator `@Global()` để tự động export `PrismaService` cho toàn bộ ứng dụng:
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

## 6. KHUNG GIAO DIỆN FRONTEND (NEXT.JS 14 APP ROUTER)

### 6.1. Hệ thống Design Tokens Google Neutral (`frontend/app/globals.css`)
Hệ màu được tinh chỉnh để tạo cảm giác chuyên nghiệp, không gây mỏi mắt:
```css
:root {
  /* Nền và bề mặt */
  --bg-primary: #f8f9fa;      /* Nền xám nhạt dịu mắt của Google Docs */
  --bg-surface: #ffffff;      /* Nền thẻ, thanh bên, cửa sổ bật lên */
  --bg-hover: #f1f3f4;        /* Màu nền khi di chuột qua */
  --border-light: #dadce0;    /* Viền mỏng 1px tinh tế */
  
  /* Màu chữ */
  --text-primary: #202124;    /* Chữ chính đen xám Google */
  --text-secondary: #5f6368;  /* Chữ phụ, mô tả, mốc thời gian */
  --text-muted: #80868b;      /* Chữ mờ, placeholder */
  
  /* Điểm nhấn thương hiệu */
  --accent-primary: #1a73e8;  /* Xanh dương Google đặc trưng */
  --accent-hover: #1557b0;
  
  /* Nhãn phân loại Pastel */
  --tag-blue-bg: #e8f0fe;  --tag-blue-text: #1967d2;
  --tag-green-bg: #e6f4ea; --tag-green-text: #137333;
  --tag-amber-bg: #fef7e0; --tag-amber-text: #b06000;
  --tag-red-bg: #fce8e6;   --tag-red-text: #c5221f;

  /* Độ cong bo góc chuẩn */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

### 6.2. Cấu trúc các thành phần Layout chính
1. **Sidebar (`frontend/components/layout/Sidebar.tsx`):**
   - Độ rộng cố định 240px.
   - Phần đầu: Logo thương hiệu `StudyWork`.
   - Phần điều hướng: Trang chủ (Dashboard), Hộp nhận (Inbox), Thùng rác (Trash).
   - **Cây Không gian (Spaces):** Danh sách các không gian học tập và làm việc có kèm biểu tượng cảm xúc (Emoji) và chỉ báo màu sắc.
   - **Các góc nhìn linh hoạt (Views):** Danh sách việc (List), Bảng kéo thả (Kanban), Lịch thời gian (Calendar), Mặt phẳng tư duy (Canvas).
   - Bộ lọc theo Nhãn (Tags).
2. **Header (`frontend/components/layout/Header.tsx`):**
   - Vị trí hiện tại (Breadcrumbs).
   - **Ô tìm kiếm toàn cục (Omni Search):** Có nhãn phím tắt `Ctrl + K`.
   - Nút **+ Tạo nhanh (C)**: Giúp người dùng ghi lại công việc hoặc ý tưởng chỉ trong 1 giây.
   - Chuông thông báo có huy hiệu chấm đỏ.
   - Avatar người dùng hiển thị tên `Vũ Khải Hoàn`.
3. **Màn hình Bento Dashboard (`frontend/app/page.tsx`):**
   - Dựng sẵn bố cục dạng lưới Bento (Bento Grid):
     - **Khối 1: Tiếp tục dở dang (Context Resume):** Mở lại ngay ghi chú hoặc đồ án đang làm trước đó.
     - **Khối 2: Ô ghi chú / tạo nhanh thông minh (Smart Capture):** Nhập nhanh nội dung cần lưu.
     - **Khối 3: Việc khẩn cấp hôm nay (Urgent Tasks):** Thẻ nhiệm vụ có nhãn đỏ và hạn chót.
     - **Khối 4: Lịch trình tiếp theo (Upcoming Agenda):** Lịch học và làm việc trong ngày.

---

## 7. QUẢN LÝ PHIÊN BẢN GIT & KIỂM SOÁT MÃ NGUỒN

### 7.1. Cấu hình loại trừ tệp rác (`.gitignore`)
File `.gitignore` tại thư mục gốc bảo vệ an toàn cho cả hai nhánh mã nguồn:
- Loại bỏ toàn bộ `node_modules/` để dung lượng repo luôn nhẹ (~vài MB thay vì vài trăm MB).
- Loại bỏ các file chứa bí mật và môi trường: `.env`, `.env.local`.
- Loại bỏ thư mục build của Next.js: `frontend/.next/`, `frontend/out/`.
- Loại bỏ thư mục build của NestJS: `backend/dist/`.

### 7.2. Lịch sử commit & đồng bộ lên GitHub
Toàn bộ khung mã nguồn, cấu hình Docker và kịch bản CSDL đã được đóng gói thành commit rõ ràng:
```powershell
# Thêm các tệp đã tạo
git add backend/ frontend/ docker-compose.yml

# Tạo commit có thông điệp chuẩn mực
git commit -m "[feat] Khoi tao khung du an Frontend (Next.js), Backend (NestJS), Docker PostgreSQL va Prisma 8 bang voi du lieu mau"

# Đẩy mã nguồn lên kho lưu trữ từ xa (GitHub Remote)
git push origin main
```
* **Mã commit:** `66dd079`
* **Kho GitHub:** [https://github.com/hoanvukhai/study-work-manager.git](https://github.com/hoanvukhai/study-work-manager.git)

---

## 8. CẨM NANG TRA CỨU LỆNH THỰC HÀNH (COMMAND CHEAT SHEET)

Bảng tổng hợp nhanh các câu lệnh cần thiết nhất để lập trình viên sử dụng hàng ngày:

| Mục đích | Câu lệnh thực thi (PowerShell) | Thư mục chạy |
| :--- | :--- | :--- |
| **Bật CSDL Docker** | `docker compose up -d` | Thư mục gốc dự án |
| **Kiểm tra trạng thái CSDL** | `docker ps` | Bất kỳ |
| **Tắt CSDL Docker** | `docker compose down` | Thư mục gốc dự án |
| **Đẩy cấu trúc Prisma** | `npx -y prisma@5.10.2 db push` | `backend/` |
| **Mở giao diện Prisma Studio** | `npx -y prisma@5.10.2 studio --port 5555` | `backend/` |
| **Nạp dữ liệu mẫu bằng psql** | `$env:PGPASSWORD = "postgrespassword"; & "F:\PostgreSQL8in\psql.exe" -U postgres -h 127.0.0.1 -p 5435 -d study_work_db -f backend/prisma/seed.sql` | Thư mục gốc dự án |
| **Xem bảng CSDL bằng psql** | `$env:PGPASSWORD = "postgrespassword"; & "F:\PostgreSQL8in\psql.exe" -U postgres -h 127.0.0.1 -p 5435 -d study_work_db -c "\dt"` | Thư mục gốc dự án |
| **Chạy Backend Dev** | `npm run start:dev` | `backend/` |
| **Chạy Frontend Dev** | `npm run dev` | `frontend/` |
| **Kiểm tra trạng thái Git** | `git status` | Thư mục gốc dự án |
| **Đẩy code lên GitHub** | `git push origin main` | Thư mục gốc dự án |

---

## 9. LỘ TRÌNH TUẦN KẾ TIẾP: BẮT ĐẦU VIẾT CODE CHỨC NĂNG

Hệ thống đã dừng lại đúng tại điểm hoàn tất toàn bộ khung kỹ thuật. Khi bạn sẵn sàng bước vào giai đoạn viết code, lộ trình thực hiện sẽ được tiến hành tuần tự theo 4 bước:

1. **Bước 1 — Module `Auth` (Xác thực & Người dùng):**
   - Viết DTO kiểm tra định dạng email, độ dài mật khẩu (`RegisterDto`, `LoginDto`).
   - Mã hóa mật khẩu bằng `bcrypt`.
   - Sinh JWT Token và xây dựng `JwtAuthGuard` để bảo vệ các route riêng tư.
2. **Bước 2 — Module `Spaces` (Quản lý Không gian):**
   - Các API: Tạo Không gian, đổi icon/màu sắc, danh sách Không gian của User hiện tại, lưu trữ Không gian cũ.
3. **Bước 3 — Module `Objects` (Hạt nhân Đa hình):**
   - API tạo nhanh một Object (Task, Note, Event, Reference).
   - API chuyển đổi trạng thái (TODO -> IN_PROGRESS -> DONE).
   - API kéo thả gán Object vào Space hoặc liên kết chéo (`DEPENDS_ON`, `RELATES_TO`).
4. **Bước 4 — Ghép API vào Giao diện Frontend (Integration):**
   - Tích hợp gọi API từ Next.js App Router (sử dụng React Server Components hoặc TanStack Query).
   - Hiển thị danh sách Không gian thật lên Sidebar.
   - Hiển thị các công việc thật lên Dashboard và bảng Kanban.
