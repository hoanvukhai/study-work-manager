# 07_API_Design.md — Thiết kế API

> Tài liệu trước: [06_Database_Design.md](06_Database_Design.md)
> Tài liệu sau: [08_UI_UX_Design.md](08_UI_UX_Design.md) và [09_Implementation.md](09_Implementation.md)

---



## Quy ước chung

- **Base URL:** `/api/v1`
- **Format:** JSON cho cả request và response (`Content-Type: application/json`)
- **Auth:** Bearer Token trong header `Authorization: Bearer <jwt_token>`
- **Error Response format:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["title must not be empty"],
  "timestamp": "2026-09-11T07:30:00.000Z"
}
```

---

## 1. Auth Module

| Endpoint | Mô tả |
|---|---|
| POST /auth/register | Đăng ký tài khoản mới |
| POST /auth/login | Đăng nhập lấy JWT access token |
| GET /auth/me | Thông tin user đăng nhập hiện tại |

### POST /auth/register — Đăng ký

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "fullName": "Nguyễn Văn A"
}
```

**Business Rules:**
- `email` phải đúng định dạng email, không được trùng với tài khoản đã có.
- `password` tối thiểu 8 ký tự.
- `fullName` không được rỗng.

**Response 201:**
```json
{
  "user": {
    "id": "uuid-user-1",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /auth/login — Đăng nhập

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Business Rules:**
- Sai email hoặc sai mật khẩu đều trả về lỗi chung `401 Unauthorized: "Email hoặc mật khẩu không chính xác"` để chống dò tài khoản.

**Response 200:** *(trả về accessToken và thông tin user)*

---

## 2. Space Module

| Endpoint | Mô tả |
|---|---|
| GET /spaces | Danh sách tất cả Space của user |
| POST /spaces | Tạo Space mới |
| GET /spaces/:id | Chi tiết một Space |
| PATCH /spaces/:id | Cập nhật thông tin Space (tên, icon, color) |
| DELETE /spaces/:id | Xóa Space (chuyển các Object con về Unassigned) |

### POST /spaces — Tạo Space mới

**Request Body:**
```json
{
  "name": "Đồ án tốt nghiệp",
  "description": "Quản lý tiến độ ĐATN",
  "icon": "🎓",
  "color": "#6366f1",
  "parentId": null
}
```

**Business Rules:**
- `name` bắt buộc, không được để trống.
- `parentId` (nếu có) phải thuộc về user hiện tại.

---

## 3. Object Core Module (Task, Note, Event, Reference)

| Endpoint | Mô tả |
|---|---|
| GET /objects | Lấy danh sách Object (lọc theo type, status, spaceId, tagId, search) |
| POST /objects | Tạo Object mới (tự động gán vào spaceId nếu có truyền) |
| GET /objects/:id | Chi tiết Object kèm tags và relations |
| PATCH /objects/:id | Cập nhật thuộc tính Object |
| PATCH /objects/:id/lifecycle | Chuyển đổi trạng thái (ARCHIVE, TRASH, RESTORE) |
| DELETE /objects/:id | Xóa vĩnh viễn (Hard delete từ Trash) |

### POST /objects — Tạo Object mới

**Request Body (Ví dụ tạo TASK):**
```json
{
  "type": "TASK",
  "title": "Hoàn thiện bản thiết kế API",
  "description": "Mô tả chi tiết các endpoint",
  "priority": "HIGH",
  "dueDate": "2026-09-12T23:59:00.000Z",
  "spaceId": "uuid-space-1",
  "tagIds": ["uuid-tag-1"]
}
```

**Business Rules:**
- `title` bắt buộc, không được rỗng.
- `type` bắt buộc thuộc một trong bốn loại: `TASK`, `NOTE`, `EVENT`, `REFERENCE`.
- Nếu truyền `spaceId`, hệ thống tự động tạo bản ghi `SpaceObject` tương ứng.

### PATCH /objects/:id/lifecycle — Quản lý vòng đời

**Request Body:**
```json
{
  "action": "TRASH" // Hợp lệ: "ARCHIVE", "TRASH", "RESTORE"
}
```

**Business Rules:**
- `TRASH`: Gán `deletedAt = now()`, ẩn khỏi mọi view và Space.
- `RESTORE`: Gán `deletedAt = null`, đưa về `ACTIVE`.
- `ARCHIVE`: Đưa vào lưu trữ, không kích hoạt thông báo nhắc việc.

---

## 4. Placement Module (Gán & Gỡ Space)

| Endpoint | Mô tả |
|---|---|
| POST /spaces/:spaceId/objects/:objectId | Đặt Object vào Space |
| DELETE /spaces/:spaceId/objects/:objectId | Gỡ Object khỏi Space (không xóa Object gốc) |

### DELETE /spaces/:spaceId/objects/:objectId — Gỡ khỏi Space

**Business Rules:**
- Chỉ xóa bản ghi vị trí trong `space_objects`.
- Dữ liệu gốc trong `objects` vẫn an toàn tuyệt đối.
- Nếu Object không còn nằm trong Space nào khác, tự động xuất hiện ở mục Unassigned.

**Response 200:**
```json
{
  "message": "Đã gỡ Object khỏi Space thành công"
}
```

---

## 5. Relation Module (Liên kết Chéo giữa các Object)

| Endpoint | Mô tả |
|---|---|
| POST /relations | Tạo liên kết giữa 2 Object bất kỳ |
| GET /objects/:id/relations | Lấy toàn bộ liên kết chiều đi và đến của một Object |
| DELETE /relations/:id | Xóa liên kết giữa 2 Object |

### POST /relations — Tạo liên kết

**Request Body:**
```json
{
  "fromObjectId": "uuid-object-task",
  "toObjectId": "uuid-object-note",
  "relationType": "REFERENCES"
}
```

**Business Rules:**
- `fromObjectId` không được trùng với `toObjectId` (không tự liên kết).
- Cả hai Object phải thuộc quyền sở hữu của user đăng nhập hiện tại.

---

## 6. Views & Dashboard Module

| Endpoint | Mô tả |
|---|---|
| GET /views/kanban | Lấy danh sách Object gom nhóm theo trạng thái (TODO, IN_PROGRESS, DONE) |
| GET /views/calendar | Lấy các Object có mốc thời gian trong khoảng `?from=&to=` |
| GET /views/timeline | Lấy danh sách Object sắp xếp theo dòng thời gian |
| GET /views/unassigned | Lấy toàn bộ các Object chưa được gán vào Space nào |
| GET /dashboard/summary | Thống kê số lượng theo status, task quá hạn, sự kiện hôm nay |

**Response GET /dashboard/summary (ví dụ):**
```json
{
  "counts": {
    "tasksTotal": 15,
    "todo": 6,
    "inProgress": 5,
    "done": 4,
    "overdue": 1,
    "notesTotal": 10,
    "eventsTotal": 3,
    "referencesTotal": 8
  },
  "todayEvents": [ ... ],
  "upcomingDeadlines": [ ... ]
}
```

---

## 7. Notification Module & Tags

| Endpoint | Mô tả |
|---|---|
| GET /notifications | Lấy danh sách thông báo nhắc việc của user |
| PATCH /notifications/:id/read | Đánh dấu một thông báo đã đọc |
| PATCH /notifications/read-all | Đánh dấu tất cả thông báo đã đọc |
| GET /tags | Danh sách Tag của user |
| POST /tags | Tạo Tag mới |
| DELETE /tags/:id | Xóa Tag |

---

*Tài liệu tiếp theo trong chuỗi: [08_UI_UX_Design.md](08_UI_UX_Design.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
