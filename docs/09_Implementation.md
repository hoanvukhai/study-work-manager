# 09_Implementation.md — Ghi chú triển khai

> **Tầng:** Development (Tầng 3 / 3)  
> **Phụ thuộc vào:** [07_API_Design.md](07_API_Design.md), [08_UI_UX_Design.md](08_UI_UX_Design.md)  
> **Tài liệu tiếp theo:** [10_Testing.md](10_Testing.md)  
> **Trạng thái:** ⬜ Chưa bắt đầu  
> **Cập nhật lần cuối:** —

---

<!--
  File này là "nhật ký kỹ thuật" — ghi lại những quyết định khi code.
  Không cần viết trước — viết song song khi code.
  Những gì ghi ở đây sẽ được đưa vào Chương 4 của báo cáo.
-->

## 1. Môi trường phát triển

| Công cụ | Phiên bản | Ghi chú |
|---|---|---|
| Node.js | 20.x LTS | |
| npm | 10.x | |
| PostgreSQL | 16.x | |
| VS Code | Latest | Extensions: Prisma, ESLint, Prettier |

### Cài đặt môi trường

```bash
# 1. Clone repo
git clone https://github.com/[username]/study-work-manager.git
cd study-work-manager

# 2. Backend
cd backend
npm install
cp .env.example .env       # Điền DATABASE_URL, JWT_SECRET
npx prisma migrate dev      # Tạo database + chạy migration
npx prisma db seed          # Seed dữ liệu mẫu (nếu có)
npm run start:dev

# 3. Frontend
cd ../frontend
npm install
cp .env.example .env.local  # Điền NEXT_PUBLIC_API_URL
npm run dev
```

---

## 2. Cấu trúc Backend (NestJS)

### Patterns sử dụng

| Pattern | Áp dụng ở đâu | Lý do |
|---|---|---|
| Repository Pattern | Tất cả Service | Tách logic DB ra khỏi Service, dễ test |
| DTO (Data Transfer Object) | Controller input | Validate và type-safe dữ liệu đầu vào |
| Guard | JWT Auth | Bảo vệ endpoint cần đăng nhập |
| Global Exception Filter | common/filters/ | Xử lý lỗi thống nhất toàn app |

### Cấu trúc một Module (ví dụ: Task)

```
task/
├── task.module.ts          ← Import dependencies, export Service
├── task.controller.ts      ← Nhận request, gọi Service, trả response
├── task.service.ts         ← Business logic
├── task.repository.ts      ← Prisma queries (nếu dùng Repository Pattern)
└── dto/
    ├── create-task.dto.ts  ← Validate input khi tạo task
    └── update-task.dto.ts  ← Validate input khi update (PartialType của create)
```

### Ví dụ DTO

```typescript
// create-task.dto.ts
// REF: FR-TASK-01 (docs/02_Requirement.md)
import { IsString, IsOptional, IsEnum, IsDateString, IsUUID, IsArray } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
```

---

## 3. Authentication Flow

```
POST /auth/login
    → Validate email/password
    → Tạo accessToken (15 phút) + refreshToken (7 ngày)
    → Trả về cả 2 token

POST /auth/refresh
    → Validate refreshToken
    → Tạo accessToken mới
    → Trả về accessToken mới

POST /auth/logout
    → Xóa refreshToken khỏi database (hoặc blacklist)
```

**Token storage (Frontend):**
- `accessToken` → lưu trong memory (variable) — không lưu localStorage
- `refreshToken` → lưu trong httpOnly cookie

---

## 4. Frontend — Conventions

### Quy tắc đặt tên component

| Loại | Quy tắc | Ví dụ |
|---|---|---|
| Page | `page.tsx` (Next.js convention) | `tasks/page.tsx` |
| Feature component | `PascalCase.tsx` | `TaskCard.tsx` |
| UI component | `PascalCase.tsx` | `Button.tsx`, `Modal.tsx` |
| Hook | `useCamelCase.ts` | `useTasks.ts`, `useAuth.ts` |
| Utility | `camelCase.ts` | `formatDate.ts` |
| Type | `camelCase.ts` hoặc `index.ts` | `types/task.ts` |

### API calls (ví dụ)

```typescript
// lib/api.ts — Axios instance
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptor: tự động thêm accessToken
api.interceptors.request.use((config) => {
  const token = getAccessToken(); // từ memory
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: tự động refresh khi 401
// ...
```

---

## 5. Ghi chú kỹ thuật phát sinh (cập nhật liên tục)

> *(Ghi lại các quyết định kỹ thuật trong quá trình code — không biết trước, viết khi gặp)*

| Ngày | Vấn đề | Giải pháp | Module |
|---|---|---|---|
| YYYY-MM-DD | ... | ... | ... |

---

*Tài liệu tiếp theo trong chuỗi: [10_Testing.md](10_Testing.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
