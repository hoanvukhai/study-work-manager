# 07_API_Design.md — Thiết kế API

> **Tầng:** Design (Tầng 2 / 3)  
> **Phụ thuộc vào:** [06_Database_Design.md](06_Database_Design.md) — Data Dictionary, [03_Functional_Analysis.md](03_Functional_Analysis.md) — Feature Matrix  
> **Tài liệu tiếp theo:** [08_UI_UX_Design.md](08_UI_UX_Design.md) và [09_Implementation.md](09_Implementation.md)  
> **Trạng thái:** ⬜ Chưa bắt đầu  
> **Cập nhật lần cuối:** —

---

<!--
  HƯỚNG DẪN VIẾT FILE NÀY:
  
  Quy trình:
  1. Thiết kế API trong file này (Markdown) — đây là "source of truth" nghiệp vụ
  2. Khi code NestJS → tạo DTO/Controller khớp với thiết kế này
  3. NestJS tự sinh Swagger từ decorator → Swagger là bản kỹ thuật bổ sung
  
  Tại sao không dùng Swagger trực tiếp?
  → Swagger không diễn đạt được business rules (vd: "dueDate < ngày tạo → reject")
  → Markdown đọc được không cần chạy server
  
  Quy tắc đặt tên endpoint:
  - RESTful: noun, plural, lowercase
  - Ví dụ: GET /tasks, POST /tasks, PATCH /tasks/:id, DELETE /tasks/:id
-->

## Quy ước chung

| | |
|---|---|
| Base URL | `http://localhost:3001/api` |
| Auth header | `Authorization: Bearer <access_token>` |
| Format | JSON (request & response) |
| Timezone | ISO 8601 với timezone (e.g. `2026-07-21T09:00:00+07:00`) |
| ID format | UUID v4 |

**HTTP Status Codes:**

| Code | Ý nghĩa |
|---|---|
| 200 OK | Thành công, có dữ liệu trả về |
| 201 Created | Tạo mới thành công |
| 204 No Content | Thành công, không có dữ liệu trả về |
| 400 Bad Request | Dữ liệu đầu vào không hợp lệ |
| 401 Unauthorized | Chưa đăng nhập hoặc token hết hạn |
| 403 Forbidden | Không có quyền |
| 404 Not Found | Không tìm thấy tài nguyên |
| 409 Conflict | Xung đột dữ liệu (ví dụ: email đã tồn tại) |
| 500 Internal Server Error | Lỗi hệ thống |

---

## 1. Auth Module

### POST /auth/register — Đăng ký tài khoản

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nguyễn Văn A"
}
```

**Business Rules:**
- Email phải hợp lệ (format email)
- Password tối thiểu 8 ký tự
- Email chưa tồn tại trong hệ thống → nếu đã tồn tại: `409 Conflict`

**Response 201:**
```json
{ "message": "Đăng ký thành công" }
```

---

### POST /auth/login — Đăng nhập

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Business Rules:**
- Email và password phải khớp → nếu sai: `401 Unauthorized`

**Response 200:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### POST /auth/refresh — Làm mới access token

**Request Body:**
```json
{ "refreshToken": "eyJ..." }
```

**Response 200:**
```json
{ "accessToken": "eyJ..." }
```

---

### POST /auth/logout — Đăng xuất

*Yêu cầu: Authorization header*

**Response 204:** *(không có body)*

---

## 2. Task Module

*Tất cả endpoint đều yêu cầu Authorization header.*  
*Mọi Task đều thuộc user đang đăng nhập — không thể đọc/sửa task của người khác.*

### GET /tasks — Lấy danh sách task

**Query Parameters:**
| Param | Kiểu | Mô tả |
|---|---|---|
| `status` | string | Lọc theo status: TODO / IN_PROGRESS / DONE / CANCELLED |
| `priority` | string | Lọc theo priority: LOW / MEDIUM / HIGH |
| `tagId` | UUID | Lọc theo tag |
| `page` | int | Trang (default: 1) |
| `limit` | int | Số item mỗi trang (default: 20, max: 100) |

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Nộp báo cáo chương 3",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2026-07-25T23:59:00+07:00",
      "tags": [{ "id": "uuid", "name": "Đồ án", "color": "#6366f1" }],
      "createdAt": "2026-07-21T09:00:00+07:00"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

---

### POST /tasks — Tạo task mới

**Request Body:**
```json
{
  "title": "Nộp báo cáo chương 3",
  "description": "Gồm phần phân tích và thiết kế",
  "priority": "HIGH",
  "dueDate": "2026-07-25T23:59:00+07:00",
  "tagIds": ["uuid-tag-1"]
}
```

**Business Rules:**
- `title` bắt buộc, không được rỗng
- `dueDate` (nếu có) không được nhỏ hơn thời điểm tạo
- `tagIds` phải thuộc user hiện tại

**Response 201:** *(trả về task vừa tạo)*

---

### GET /tasks/:id — Xem chi tiết task

**Business Rules:**
- Task phải thuộc user hiện tại → `403 Forbidden` nếu không phải

**Response 200:** *(trả về task đầy đủ gồm tags và references)*

---

### PATCH /tasks/:id — Cập nhật task

**Request Body:** *(tất cả fields đều optional)*
```json
{
  "title": "...",
  "status": "IN_PROGRESS",
  "dueDate": "..."
}
```

**Business Rules:**
- Không thể sửa task của người khác → `403 Forbidden`
- Task status `DONE` hoặc `CANCELLED` → không thể sửa các field khác (chỉ có thể reopen)

**Response 200:** *(trả về task đã cập nhật)*

---

### DELETE /tasks/:id — Xóa task

**Business Rules:**
- Soft delete (đánh dấu `deletedAt`) hoặc hard delete — quyết định khi code

**Response 204**

---

## 3. Learning Module

*(Tương tự Task Module — cấu trúc endpoint giống nhau)*

| Endpoint | Mô tả |
|---|---|
| GET /learning | Danh sách learning items |
| POST /learning | Tạo learning item mới |
| GET /learning/:id | Chi tiết |
| PATCH /learning/:id | Cập nhật (bao gồm `progress` 0–100) |
| DELETE /learning/:id | Xóa |

**Business Rule đặc thù:**
- `progress` phải là số nguyên 0–100
- Khi `progress = 100`, status tự động chuyển sang `COMPLETED`

---

## 4. Calendar Module

| Endpoint | Mô tả |
|---|---|
| GET /calendar | Lấy events trong khoảng thời gian (`?from=&to=`) |
| POST /calendar | Tạo event mới (có thể gắn taskId/learningId) |
| PATCH /calendar/:id | Cập nhật event |
| DELETE /calendar/:id | Xóa event |

**Business Rule:**
- `startTime` bắt buộc
- `endTime` (nếu có) phải >= `startTime`
- Một event chỉ được gắn với **một** task hoặc **một** learning item (không phải cả hai)

---

## 5. Reference Module

| Endpoint | Mô tả |
|---|---|
| GET /references | Danh sách (lọc theo taskId/learningId) |
| POST /references | Tạo mới |
| PATCH /references/:id | Cập nhật |
| DELETE /references/:id | Xóa |

---

## 6. Notification Module

| Endpoint | Mô tả |
|---|---|
| GET /notifications | Lấy danh sách notifications của user |
| PATCH /notifications/:id/read | Đánh dấu đã đọc |
| PATCH /notifications/read-all | Đánh dấu tất cả đã đọc |

---

## 7. Dashboard Module

| Endpoint | Mô tả |
|---|---|
| GET /dashboard/summary | Tổng quan: số task theo status, learning sắp deadline, events hôm nay |

**Response 200 (ví dụ):**
```json
{
  "tasks": {
    "total": 12,
    "todo": 5,
    "inProgress": 4,
    "done": 3,
    "overdue": 2
  },
  "todayEvents": [...],
  "upcomingDeadlines": [...]
}
```

---

*Tài liệu tiếp theo trong chuỗi: [08_UI_UX_Design.md](08_UI_UX_Design.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
