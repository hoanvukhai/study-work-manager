# 09_Implementation.md — Ghi chú triển khai

> **Tầng:** Development (Tầng 3 / 3)  
> **Phụ thuộc vào:** [07_API_Design.md](07_API_Design.md), [08_UI_UX_Design.md](08_UI_UX_Design.md)  
> **Tài liệu tiếp theo:** [10_Testing.md](10_Testing.md)  
> **Trạng thái:** ⬜ Chưa bắt đầu  
> **Cập nhật lần cuối:** 24/09/2026 (Đồng bộ theo Kiến trúc Lần 3 — Hạt nhân Đa hình Object)

---

## 1. Môi trường phát triển

| Công cụ | Phiên bản | Ghi chú |
|---|---|---|
| Node.js | 20.x LTS | Môi trường runtime JavaScript/TypeScript |
| npm | 10.x | Quản lý gói |
| PostgreSQL | 16.x | Cơ sở dữ liệu chính (8 bảng Lần 3) |
| Prisma ORM | 5.x | ORM kết nối CSDL và sinh TypeScript client |
| NestJS | 10.x | Framework Backend |
| Next.js | 14.x / 15.x | Framework Frontend (App Router) |

### Cài đặt môi trường

```bash
# 1. Clone repository
git clone https://github.com/hoanvukhai/study-work-manager.git
cd study-work-manager

# 2. Khởi tạo Backend (NestJS + Prisma)
cd backend
npm install
cp .env.example .env          # Điền DATABASE_URL, JWT_SECRET
npx prisma migrate dev         # Chạy migration tạo 8 bảng dữ liệu
npx prisma db seed             # Nạp dữ liệu mẫu
npm run start:dev

# 3. Khởi tạo Frontend (Next.js)
cd ../frontend
npm install
cp .env.example .env.local     # Điền NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
npm run dev
```

---

## 2. Cấu trúc Backend (NestJS — Kiến trúc Lần 3)

### Danh mục các Module chính:
* `auth/`: Xác thực tài khoản (JWT, Register, Login, Me).
* `space/`: Quản lý Không gian học tập & làm việc.
* `object/`: **Hạt nhân đa hình** xử lý CRUD cho Task, Note, Event, Reference; quản lý vòng đời dữ liệu (`ACTIVE`, `ARCHIVE`, `TRASH`).
* `space-object/`: Xử lý bảng trung gian n-n (gán/gỡ Object vào Space, vị trí position, ghim pinned).
* `relation/`: Xử lý liên kết chéo 2 chiều giữa 2 Object bất kỳ.
* `view/`: Cung cấp dữ liệu theo góc nhìn (Kanban lọc theo Task status, Calendar lọc theo thời gian, Unassigned lấy Inbox).
* `notification/` & `tag/`: Xử lý nhắc nhở và gắn thẻ phân loại.

```
backend/src/
├── auth/
├── space/
├── object/                      ← Module hạt nhân đa hình
│   ├── object.module.ts
│   ├── object.controller.ts     ← Định tuyến API /objects
│   ├── object.service.ts        ← Nghiệp vụ xử lý đa hình & vòng đời
│   ├── object.repository.ts     ← Truy vấn Prisma
│   └── dto/
│       ├── create-object.dto.ts ← DTO tạo Task/Note/Event/Ref
│       ├── update-object.dto.ts
│       └── lifecycle-action.dto.ts
├── space-object/                ← Gán / gỡ Object vào Space
├── relation/                    ← Liên kết chéo giữa các Object
├── view/                        ← Các góc nhìn Kanban, Calendar, Dashboard
└── common/
    ├── guards/jwt-auth.guard.ts
    └── filters/http-exception.filter.ts
```

### Ví dụ DTO Hạt nhân: `CreateObjectDto`

```typescript
// backend/src/object/dto/create-object.dto.ts
// REF: 02_Requirement.md (FR-TASK, FR-NOTE, FR-EVENT, FR-REF) & 07_API_Design.md
import { IsString, IsOptional, IsEnum, IsDateString, IsUUID, IsObject } from 'class-validator';

export enum ObjectType {
  TASK = 'TASK',
  NOTE = 'NOTE',
  EVENT = 'EVENT',
  REFERENCE = 'REFERENCE',
}

export class CreateObjectDto {
  @IsEnum(ObjectType)
  type: ObjectType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['TODO', 'IN_PROGRESS', 'DONE'])
  status?: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsUUID('4')
  spaceId?: string; // Tùy chọn: tự động gán vào Space nếu được truyền
}
```

---

## 3. Quy ước Frontend (Next.js)

* Sử dụng **App Router** (`app/` directory).
* Quản lý trạng thái: React Query / TanStack Query (caching API) + Zustand (quản lý state cục bộ).
* Styling: Vanilla CSS kết hợp cấu trúc Design System Google Neutral Palette (Off-white `#f8f9fa`, Border `#dadce0`, Dark Charcoal `#202124`).

---

*Tài liệu tiếp theo: [10_Testing.md](10_Testing.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
