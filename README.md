# study-work-manager

> Đồ án tốt nghiệp — Xây dựng ứng dụng quản lý học tập và công việc cá nhân  
> *(Personal Study & Work Management System)*

---

## Giới thiệu

Ứng dụng web giúp người dùng cá nhân (sinh viên, freelancer, người tự học) quản lý tập trung:

- **Task** — công việc cần làm, có deadline
- **Learning** — nội dung học tập, có tiến độ riêng
- **Calendar** — lịch trình cá nhân, đồng bộ với Task/Learning
- **Reference** — tài liệu tham khảo, gắn trực tiếp với Task/Learning
- **Dashboard** — tổng quan toàn bộ trong một màn hình

Thay vì phải dùng Google Calendar + Google Drive + Trello + GitHub cùng lúc, mọi thứ nằm trong một hệ thống duy nhất.

---

## Tech Stack

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| Frontend | Next.js + TypeScript | 14+ (App Router) |
| Styling | TailwindCSS | 3.x |
| Backend | NestJS + TypeScript | 10+ |
| Database | PostgreSQL | 16+ |
| ORM | Prisma | 5+ |
| Authentication | JWT (Access + Refresh Token) | — |
| Version Control | Git + GitHub | — |

---

## Cấu trúc thư mục

```
study-work-manager/
├── README.md              ← file này
├── .gitignore
│
├── docs/                  ← 12 tài liệu phân tích & thiết kế
│   ├── README.md          ← Mục lục + tiến độ
│   └── 01–12_*.md
│
├── diagrams/              ← Sơ đồ draw.io
│   └── *.drawio
│
├── design/                ← Link Figma (không commit .fig)
│   └── README.md
│
├── report/                ← Bản nháp báo cáo tốt nghiệp
│   ├── drafts/
│   ├── images/
│   └── references/
│
├── meeting/               ← Biên bản họp với GVHD
│   └── *.md
│
├── backend/               ← NestJS (khởi tạo sau khi xong docs 01-08)
└── frontend/              ← Next.js (khởi tạo sau khi xong docs 01-08)
```

---

## Tài liệu phân tích & thiết kế

→ Xem **[docs/README.md](docs/README.md)** để biết toàn bộ 12 tài liệu và tiến độ hiện tại.

Chuỗi phụ thuộc tài liệu:

```
Research → Requirement → Functional Analysis
                              ↓              ↓
                     Architecture       Domain Model
                              ↓              ↓
                         Database Design ←────┘
                              ↓
                          API Design
                              ↓
                         UI/UX Design
                              ↓
                        Implementation
                              ↓
                           Testing
                              ↓
                          Deployment
```

---

## Kế hoạch thực hiện

| Giai đoạn | Nội dung | Thời gian |
|---|---|---|
| GĐ1 | Research → Requirement → Functional Analysis | Tuần 1–3 |
| GĐ2 | Architecture → Domain → DB → API → UI | Tuần 4–8 |
| GĐ3 | Backend (Auth, Task, Learning, Calendar, Reference) | Tuần 9–13 |
| GĐ4 | Frontend | Tuần 14–17 |
| GĐ5 | Testing & Deployment | Tuần 18–20 |
| GĐ6 | Hoàn thiện báo cáo | Tuần 21–22 |

---

## Quy tắc commit

```
[scope] Mô tả ngắn gọn

scope: docs | diagram | feat | fix | report | meeting | chore | refactor
```

**Ví dụ:**
```
[docs] Hoàn thành 02_Requirement.md — thêm 25 functional requirements
[diagram] Cập nhật ERD sau khi điều chỉnh quan hệ Task-Tag
[feat] Implement TaskService CRUD + validation deadline
[report] Draft chương 3 — phần thiết kế cơ sở dữ liệu
```

---

## Git Tags (cột mốc)

| Tag | Ý nghĩa |
|---|---|
| `v0.1-docs-business` | Xong Tầng 1: Research, Requirement, Functional Analysis |
| `v0.2-docs-design` | Xong Tầng 2: Architecture → UI/UX |
| `v0.3-backend` | Backend hoạt động cơ bản |
| `v0.4-frontend` | Frontend hoạt động cơ bản |
| `v0.5-testing` | Xong kiểm thử |
| `v1.0-final` | Bản nộp cuối cùng |

---

## Cách chạy (cập nhật sau khi khởi tạo code)

```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

---

*Đồ án tốt nghiệp — [Năm học 2025–2026]*  
*Sinh viên thực hiện: [Tên sinh viên]*  
*Giảng viên hướng dẫn: [Tên GVHD]*
