# 04_System_Architecture.md — Kiến trúc hệ thống

> **Tầng:** Design (Tầng 2 / 3)  
> **Phụ thuộc vào:** [03_Functional_Analysis.md](03_Functional_Analysis.md) — Feature Matrix, Use Cases  
> **Tài liệu tiếp theo:** [06_Database_Design.md](06_Database_Design.md) (cùng với [05_Domain_Model.md](05_Domain_Model.md))  
> **Trạng thái:** ⬜ Chưa bắt đầu  
> **Cập nhật lần cuối:** —

---

<!--
  HƯỚNG DẪN VIẾT FILE NÀY:
  
  Tài liệu này trả lời câu hỏi: "Hệ thống được tổ chức như thế nào?"
  KHÔNG phải câu hỏi "Database có bảng gì?" (→ đó là 06_Database_Design.md)
  KHÔNG phải câu hỏi "API có endpoint nào?" (→ đó là 07_API_Design.md)
  
  Sơ đồ kiến trúc: ../diagrams/02_Architecture.drawio
  Sơ đồ context: ../diagrams/01_Context.drawio
-->

## 1. Context Diagram (Sơ đồ ngữ cảnh)

> Hệ thống kết nối với ai/cái gì bên ngoài?

```
Sơ đồ: ../diagrams/01_Context.drawio
```

<!-- ![Context Diagram](../diagrams/exports/context.png) -->

**Actors bên ngoài:**
- **User** — người dùng cuối, tương tác qua trình duyệt
- *(Hiện tại không tích hợp với dịch vụ ngoài — Google Calendar, Drive... nằm ngoài phạm vi)*

---

## 2. High-Level Architecture

```
Sơ đồ: ../diagrams/02_Architecture.drawio
```

<!-- ![Architecture Diagram](../diagrams/exports/architecture.png) -->

**Mô tả luồng chính:**

```
[Trình duyệt]
    ↓ HTTP/HTTPS
[Next.js — Frontend]
    ↓ REST API (JSON)
[NestJS — Backend]
    ↓ Prisma ORM
[PostgreSQL — Database]
```

**Giải thích:**
- **Next.js** phục vụ giao diện người dùng, gọi API sang NestJS.
- **NestJS** xử lý logic nghiệp vụ, xác thực JWT, truy vấn database.
- **PostgreSQL** lưu trữ toàn bộ dữ liệu.
- Không có service nào khác ở giai đoạn MVP.

---

## 3. Danh sách Module & Dependency

| Module | Trách nhiệm | Phụ thuộc vào |
|---|---|---|
| AuthModule | Đăng ký, đăng nhập, JWT | — |
| TaskModule | CRUD Task, gắn tag, deadline | AuthModule |
| LearningModule | CRUD Learning, tiến độ, deadline | AuthModule |
| CalendarModule | Lịch trình, đồng bộ Task/Learning | TaskModule, LearningModule |
| ReferenceModule | Lưu tài liệu tham khảo, gắn Task/Learning | TaskModule, LearningModule |
| NotificationModule | Tạo notification khi đến deadline | TaskModule, LearningModule |
| DashboardModule | Tổng hợp dữ liệu từ các module khác | Tất cả |

**Module Dependency Diagram:**
```
AuthModule ←── TaskModule ←──┬── CalendarModule
                              ├── ReferenceModule
            LearningModule ←─┘
                              └── NotificationModule
                                        ↑
                            DashboardModule (đọc từ tất cả)
```

---

## 4. Decision Log (Lý do chọn công nghệ)

> Mục này quan trọng khi bảo vệ đồ án — hội đồng hay hỏi "Tại sao em chọn X mà không chọn Y?"

| Quyết định | Lựa chọn | Thay thế đã xem xét | Lý do |
|---|---|---|---|
| Database | PostgreSQL | MongoDB | Dữ liệu có quan hệ rõ ràng (Task → Tag, Learning → Calendar), SQL phù hợp hơn NoSQL |
| ORM | Prisma | TypeORM, Sequelize | Type-safe, migration tường minh, schema.prisma dễ đọc |
| Backend framework | NestJS | Express.js | NestJS có cấu trúc module rõ ràng, DI, phù hợp dự án có nhiều module |
| Frontend framework | Next.js | Create React App, Vite | App Router, SSR/SSG, routing tích hợp sẵn |
| Authentication | JWT (stateless) | Session-based | Phù hợp với REST API, không cần lưu session trên server |
| Cache | Không dùng | Redis | Đồ án 1 người dùng, không có nhu cầu performance đến mức cần cache |

---

## 5. Cấu trúc thư mục Backend (dự kiến)

```
backend/src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   └── login.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── task/
│   ├── task.module.ts
│   ├── task.controller.ts
│   ├── task.service.ts
│   └── dto/
├── learning/    (tương tự task/)
├── calendar/    (tương tự task/)
├── reference/   (tương tự task/)
├── notification/ (tương tự task/)
├── dashboard/
│   ├── dashboard.module.ts
│   └── dashboard.service.ts   ← chỉ đọc, không controller riêng
├── prisma/
│   └── prisma.service.ts
└── common/
    ├── decorators/
    ├── filters/               ← Global exception filter
    ├── interceptors/
    └── pipes/
```

---

## 6. Cấu trúc thư mục Frontend (dự kiến)

```
frontend/src/
├── app/                        ← Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx          ← Layout chung: sidebar + header
│   │   ├── dashboard/page.tsx
│   │   ├── tasks/
│   │   │   ├── page.tsx        ← Danh sách task
│   │   │   └── [id]/page.tsx   ← Chi tiết task
│   │   ├── learning/
│   │   ├── calendar/
│   │   └── references/
│   └── api/                    ← Next.js Route Handlers (nếu cần)
├── components/
│   ├── ui/                     ← Button, Input, Modal, Card...
│   └── features/               ← TaskCard, LearningItem...
├── hooks/                      ← useAuth, useTasks, useCalendar...
├── lib/
│   ├── api.ts                  ← Axios/Fetch wrapper
│   └── utils.ts
└── types/                      ← TypeScript interfaces
    └── index.ts
```

---

*Tài liệu tiếp theo trong chuỗi: [06_Database_Design.md](06_Database_Design.md) (cần kết hợp với [05_Domain_Model.md](05_Domain_Model.md))*  
*Quay lại mục lục: [docs/README.md](README.md)*
