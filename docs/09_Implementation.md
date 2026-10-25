# 09_Implementation.md — Ghi chú triển khai mã nguồn

> Tài liệu trước: [07_API_Design.md](07_API_Design.md) và [08_UI_UX_Design.md](08_UI_UX_Design.md)
> Tài liệu sau: [10_Testing.md](10_Testing.md)

---

## 1. Công nghệ và môi trường

| Thành phần | Phiên bản | Ghi chú |
|---|---|---|
| Node.js | 20 LTS | |
| NestJS | 10 | Backend, kiến trúc module (Controller → Service → Prisma) |
| Prisma ORM | 5 | Truy cập CSDL, **migration** có đánh số |
| PostgreSQL | 16 | |
| Next.js | 14 (App Router) | Giao diện, TypeScript |
| TanStack Query | 5 | Gọi API, lưu tạm và tự làm mới dữ liệu |
| Jest + Supertest | 29 / 6 | Kiểm thử |
| Thư viện nổi bật | `@nestjs/schedule`, `@nestjs/throttler`, `helmet`, `nodemailer`, `react-markdown`, `bcrypt` | |

Thuật toán **tự cài đặt** (không dùng thư viện): phát hiện vòng phụ thuộc, chấm điểm gợi ý "Hôm nay làm gì?", SM-2, tính lần lặp kế tiếp, bố cục đồ thị lực đẩy–kéo (Fruchterman–Reingold), sinh iCalendar.

## 2. Cấu trúc Backend (`backend/src/`)

```
src/
├── main.ts                    # Khởi động: helmet, CORS, ValidationPipe, bộ lọc lỗi, Swagger
├── app.module.ts              # Gắn các module + ThrottlerGuard toàn cục + ScheduleModule
├── common/                    # Dùng chung: bộ lọc lỗi, múi giờ Việt Nam (timezone.ts)
├── prisma/                    # PrismaService (global)
├── auth/                      # Đăng ký/đăng nhập, JWT, hồ sơ, đổi/quên/đặt lại mật khẩu, khoá tạm
├── space/                     # Space: CRUD, tiến độ, ghim/sắp xếp, công cụ, mẫu dựng sẵn (templates.ts)
├── object/                    # Object: CRUD, vòng đời, chuyển loại, gán Space, phân trang
├── relation/                  # Liên kết + luật phụ thuộc/việc con (cấm vòng)
├── view/                      # Kanban, Lịch, Dashboard tổng quan
├── planning/                  # Trụ Kế hoạch: graph.ts (vòng), scoring.ts (chấm điểm), overview
├── study/                     # Trụ Học tập: sm2.ts, cards.ts, thẻ, phiên học, thống kê
├── knowledge/                 # Trụ Tri thức: mentions.ts ([[ ]]), đồng bộ liên kết, đồ thị
├── recurrence/                # Luật lặp (recurrence.ts) + sinh lần kế tiếp (cron)
├── notifications/             # Bộ máy thông báo: rules.ts, quét định kỳ, bản tin, cài đặt
├── calendar/                  # Xuất .ics (ics.ts) bằng token bí mật
├── reports/                   # Báo cáo tuần
├── account/                   # Xuất dữ liệu cá nhân
├── admin/                     # Quản trị: RolesGuard, người dùng, thống kê, thông báo hệ thống, nhật ký
└── mail/                      # Gửi email (SMTP hoặc ghi log ở chế độ dev)
```

**Nguyên tắc thiết kế mã:**
- **Hàm thuần tách khỏi truy cập CSDL** (`graph.ts`, `scoring.ts`, `sm2.ts`, `recurrence.ts`, `rules.ts`, `ics.ts`...) → test được chính xác bằng unit test, không cần CSDL.
- **Mọi truy vấn dữ liệu người dùng đều lọc theo `userId`** ngay trong Service; lỗi "không tìm thấy" và "không thuộc về bạn" cùng trả 404.
- **Ràng buộc đặt ở nhiều tầng:** DTO (`class-validator`) → Service (luật nghiệp vụ) → CSDL (`CHECK`, `UNIQUE`, khoá ngoại) — để dữ liệu sai bị chặn dù đi đường nào.
- Thao tác nhiều bước dùng **transaction** (tạo Object + gán Space, sinh lần lặp, tạo Space từ mẫu, đồng bộ liên kết).
- Mọi giá trị thời gian lưu UTC; phép tính theo ngày dùng múi giờ Việt Nam (`common/timezone.ts`).

## 3. Cấu trúc Frontend (`frontend/`)

```
app/
├── login, register, forgot-password, reset-password   # Công khai
└── (dashboard)/                                       # Cần đăng nhập, có Sidebar + Header
    ├── page.tsx (Tổng quan: "Hôm nay làm gì?", ôn tập)
    ├── spaces/[id], kanban, calendar, inbox, archive, trash
    ├── study, graph, reports, notifications, profile, admin
components/
├── ui/            # Bộ component dùng chung: Button, Input, Dialog, ConfirmDialog, Toast (có Hoàn tác), ...
├── layout/        # Sidebar, Header, MobileNav, CommandPalette (Ctrl+K)
├── objects/       # ObjectDetailDrawer (khung chi tiết duy nhất), CreateObjectModal, RecurrenceField
├── knowledge/     # LinkTextarea ([[ ]]), MarkdownView, GraphView (bản đồ)
├── planning/, study/, notifications/, spaces/, views/
hooks/             # Hook TanStack Query cho từng nhóm API
lib/               # Gọi API, ngữ cảnh đăng nhập/giao diện, datetime.ts (xử lý giờ địa phương), graph-layout.ts
```

**Quy ước giao diện:** CSS Modules + biến màu (sáng/tối); không dùng `confirm()`/`alert()` (dùng `ConfirmDialog`/`Toast`); **một khung chi tiết duy nhất** (`ObjectDetailDrawer`) thay cho nhiều hộp thoại sửa rời rạc; dữ liệu server luôn đi qua TanStack Query để các trang không lệch nhau; không dùng `toISOString()` để hiển thị thời gian (xem `lib/datetime.ts`).

Markdown được hiển thị bằng `react-markdown` **không cho HTML thô** (chống XSS) và tự lọc liên kết nguy hiểm.

## 4. Các điểm kỹ thuật đáng chú ý

| Vấn đề | Cách giải quyết |
|---|---|
| Cấm vòng phụ thuộc A→B→C→A | Khi tạo liên kết, duyệt DFS từ đích xem có tới được nguồn không (`planning/graph.ts`) |
| Gợi ý "Hôm nay làm gì?" giải thích được | Điểm = độ gấp theo hạn + ưu tiên + đang làm dở + số việc được mở khoá; mỗi cộng điểm sinh một "lý do" hiển thị cho người dùng |
| Ôn tập đúng lúc sắp quên | SM-2 theo bản gốc (cập nhật hệ số dễ trước, rồi mới tính khoảng cách); Quên → hiện lại sau 10 phút |
| Ôn theo ngữ cảnh | Thẻ của Note có liên kết với việc sắp đến hạn (3 ngày) được xếp trước |
| `[[Tiêu đề]]` tự thành liên kết | Đồng bộ khi lưu; chỉ xoá liên kết `auto`, không đụng liên kết tạo tay; trùng tiêu đề lấy mục mới cập nhật nhất |
| Chống thông báo trùng | Khoá duy nhất `(user_id, dedupe_key)`; đổi hạn chót thì khoá đổi nên báo lại đúng |
| Việc lặp không sinh trùng | Cờ `recurrence_spawned`; chỉ đặt lại khi luật thật sự đổi (lỗi này từng suýt xảy ra, có test hồi quy) |
| Lỗi múi giờ | Hiển thị theo giờ địa phương (`lib/datetime.ts`); tính theo ngày ở máy chủ theo giờ Việt Nam; test ở biên 23:30/00:30 |
| Bản đồ tri thức mượt | Bố cục lực đẩy–kéo tự viết, tính một lần khi dữ liệu đổi, tự căn vừa khung; giới hạn 400 nút |
| Lịch `.ics` an toàn | Token ngẫu nhiên 64 ký tự (tạo lại được), chỉ đưa tiêu đề, tài khoản bị khoá → 404 |
| Đặt lại mật khẩu an toàn | Token ngẫu nhiên, **chỉ lưu băm SHA-256**, hết hạn 30 phút, dùng một lần; phản hồi giống nhau dù email có tồn tại hay không |

---

*Tài liệu tiếp theo: [10_Testing.md](10_Testing.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
