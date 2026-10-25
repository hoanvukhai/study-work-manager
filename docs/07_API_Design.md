# 07_API_Design.md — Thiết kế API

> Tài liệu trước: [06_Database_Design.md](06_Database_Design.md)
> Tài liệu sau: [08_UI_UX_Design.md](08_UI_UX_Design.md) và [09_Implementation.md](09_Implementation.md)
>
> **Danh sách endpoint được SINH TỰ ĐỘNG từ các controller** (`backend/src/**/*.controller.ts`) nên luôn khớp mã nguồn (tổng **59 endpoint**). Mô tả chi tiết từng trường dữ liệu: Swagger tại `/api/docs` khi chạy backend.

---

## 1. Quy ước chung

- **Địa chỉ gốc:** `/api/v1`. Dữ liệu vào/ra: JSON (`Content-Type: application/json`), trừ `.ics` (text/calendar).
- **Xác thực:** `Authorization: Bearer <accessToken>` (JWT, mặc định hết hạn sau 7 ngày). Cột "Quyền": *Công khai* = không cần đăng nhập; *Đăng nhập* = cần JWT; *Admin* = cần JWT và vai trò `ADMIN`.
- **Cách ly dữ liệu:** mọi endpoint "Đăng nhập" chỉ thao tác trên dữ liệu của chính người gọi; truy cập dữ liệu người khác trả **404** (không phải 403, để không lộ sự tồn tại).
- **Kiểm tra dữ liệu vào:** `ValidationPipe` với `whitelist` + `forbidNonWhitelisted` — gửi trường không khai báo bị từ chối **400** (chống mass assignment).
- **Định dạng lỗi:**

```json
{
  "statusCode": 400,
  "message": "Tiêu đề không được để trống",
  "errors": ["Tiêu đề không được để trống"],
  "timestamp": "2026-10-25T07:30:00.000Z"
}
```

- **Mã trạng thái thường gặp:** 400 dữ liệu sai · 401 chưa/không còn đăng nhập · 403 không đủ quyền (Admin) · 404 không tìm thấy hoặc không thuộc về bạn · 409 trùng dữ liệu · 429 gọi quá nhanh.
- **Giới hạn tần suất:** mặc định 300 yêu cầu/phút/IP; đăng nhập, đăng ký, quên và đặt lại mật khẩu có giới hạn riêng (10/phút). Sai mật khẩu 5 lần thì khoá đăng nhập tạm 15 phút (một thông báo lỗi chung cho mọi lý do, không lộ tài khoản).
- **Phân trang:** `GET /objects` nhận `limit` (1–500, mặc định 500) và `offset`; tổng số khớp bộ lọc trả qua header `X-Total-Count`.
- **Thời gian:** ISO 8601 UTC; giao diện đổi sang giờ địa phương. Các phép tính "theo ngày" ở máy chủ (chuỗi ngày học, báo cáo tuần, bản tin sáng) dùng giờ Việt Nam (UTC+7).

---

## 2. Danh sách endpoint


### Tài khoản — xuất dữ liệu

| Phương thức | Đường dẫn | Quyền | Hàm xử lý | Ghi chú |
|---|---|---|---|---|
| `GET` | `/api/v1/account/export` | Đăng nhập | `export` | giới hạn riêng |

### Quản trị (chỉ ADMIN)

| Phương thức | Đường dẫn | Quyền | Hàm xử lý | Ghi chú |
|---|---|---|---|---|
| `GET` | `/api/v1/admin/users` | Admin | `listUsers` |  |
| `PATCH` | `/api/v1/admin/users/:id/lock` | Admin | `lock` |  |
| `PATCH` | `/api/v1/admin/users/:id/unlock` | Admin | `unlock` |  |
| `GET` | `/api/v1/admin/stats` | Admin | `stats` |  |
| `POST` | `/api/v1/admin/broadcast` | Admin | `broadcast` |  |
| `GET` | `/api/v1/admin/audit-logs` | Admin | `auditLogs` |  |

### Xác thực & Tài khoản

| Phương thức | Đường dẫn | Quyền | Hàm xử lý | Ghi chú |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Công khai | `register` | giới hạn riêng |
| `POST` | `/api/v1/auth/login` | Công khai | `login` | giới hạn riêng |
| `POST` | `/api/v1/auth/forgot-password` | Công khai | `forgotPassword` | giới hạn riêng |
| `POST` | `/api/v1/auth/reset-password` | Công khai | `resetPassword` | giới hạn riêng |
| `GET` | `/api/v1/auth/me` | Đăng nhập | `getProfile` |  |
| `PATCH` | `/api/v1/auth/profile` | Đăng nhập | `updateProfile` |  |
| `POST` | `/api/v1/auth/change-password` | Đăng nhập | `changePassword` |  |

### Xuất lịch (.ics)

| Phương thức | Đường dẫn | Quyền | Hàm xử lý | Ghi chú |
|---|---|---|---|---|
| `GET` | `/api/v1/calendar/feed-token` | Đăng nhập | `getFeedToken` |  |
| `POST` | `/api/v1/calendar/feed-token/rotate` | Đăng nhập | `rotate` |  |
| `GET` | `/api/v1/calendar/feed/:file` | Công khai | `feed` |  |

### Trụ Tri thức

| Phương thức | Đường dẫn | Quyền | Hàm xử lý | Ghi chú |
|---|---|---|---|---|
| `GET` | `/api/v1/knowledge/graph` | Đăng nhập | `getGraph` |  |

### Thông báo

| Phương thức | Đường dẫn | Quyền | Hàm xử lý | Ghi chú |
|---|---|---|---|---|
| `GET` | `/api/v1/notifications` | Đăng nhập | `list` |  |
| `GET` | `/api/v1/notifications/unread-count` | Đăng nhập | `unreadCount` |  |
| `GET` | `/api/v1/notifications/settings` | Đăng nhập | `getSettings` |  |
| `PATCH` | `/api/v1/notifications/settings` | Đăng nhập | `updateSettings` |  |
| `PATCH` | `/api/v1/notifications/read-all` | Đăng nhập | `markAllRead` |  |
| `PATCH` | `/api/v1/notifications/:id/read` | Đăng nhập | `markRead` |  |
| `DELETE` | `/api/v1/notifications/:id` | Đăng nhập | `remove` |  |

### Mục (Object) & Vòng đời & Gán Space

| Phương thức | Đường dẫn | Quyền | Hàm xử lý | Ghi chú |
|---|---|---|---|---|
| `POST` | `/api/v1/objects` | Đăng nhập | `create` |  |
| `GET` | `/api/v1/objects` | Đăng nhập | `findAll` |  |
| `DELETE` | `/api/v1/objects/trash/empty` | Đăng nhập | `emptyTrash` |  |
| `GET` | `/api/v1/objects/:id` | Đăng nhập | `findOne` |  |
| `PATCH` | `/api/v1/objects/:id` | Đăng nhập | `update` |  |
| `PATCH` | `/api/v1/objects/:id/lifecycle` | Đăng nhập | `updateLifecycle` |  |
| `PATCH` | `/api/v1/objects/:id/convert-type` | Đăng nhập | `convertType` |  |
| `DELETE` | `/api/v1/objects/:id` | Đăng nhập | `remove` |  |
| `POST` | `/api/v1/objects/:id/spaces/:spaceId` | Đăng nhập | `attachToSpace` |  |
| `DELETE` | `/api/v1/objects/:id/spaces/:spaceId` | Đăng nhập | `removeFromSpace` |  |

### Trụ Kế hoạch

| Phương thức | Đường dẫn | Quyền | Hàm xử lý | Ghi chú |
|---|---|---|---|---|
| `GET` | `/api/v1/planning/overview` | Đăng nhập | `getOverview` |  |

### Liên kết giữa các Object

| Phương thức | Đường dẫn | Quyền | Hàm xử lý | Ghi chú |
|---|---|---|---|---|
| `POST` | `/api/v1/relations` | Đăng nhập | `create` |  |
| `GET` | `/api/v1/relations/object/:objectId` | Đăng nhập | `findByObjectId` |  |
| `DELETE` | `/api/v1/relations/:id` | Đăng nhập | `remove` |  |

### Báo cáo tuần

| Phương thức | Đường dẫn | Quyền | Hàm xử lý | Ghi chú |
|---|---|---|---|---|
| `GET` | `/api/v1/reports/weekly` | Đăng nhập | `weekly` |  |

### Không gian (Space)

| Phương thức | Đường dẫn | Quyền | Hàm xử lý | Ghi chú |
|---|---|---|---|---|
| `POST` | `/api/v1/spaces` | Đăng nhập | `create` |  |
| `GET` | `/api/v1/spaces/templates` | Đăng nhập | `listTemplates` |  |
| `POST` | `/api/v1/spaces/from-template` | Đăng nhập | `createFromTemplate` |  |
| `GET` | `/api/v1/spaces` | Đăng nhập | `findAll` |  |
| `GET` | `/api/v1/spaces/:id` | Đăng nhập | `findOne` |  |
| `PATCH` | `/api/v1/spaces/:id` | Đăng nhập | `update` |  |
| `PATCH` | `/api/v1/spaces/:spaceId/objects/:objectId` | Đăng nhập | `updatePlacement` |  |
| `POST` | `/api/v1/spaces/:id/reorder` | Đăng nhập | `reorder` |  |
| `DELETE` | `/api/v1/spaces/:id` | Đăng nhập | `remove` |  |

### Trụ Học tập

| Phương thức | Đường dẫn | Quyền | Hàm xử lý | Ghi chú |
|---|---|---|---|---|
| `POST` | `/api/v1/study/notes/:objectId/sync-cards` | Đăng nhập | `syncCards` |  |
| `GET` | `/api/v1/study/notes/:objectId/cards` | Đăng nhập | `listCards` |  |
| `GET` | `/api/v1/study/due` | Đăng nhập | `getDue` |  |
| `POST` | `/api/v1/study/cards/:id/review` | Đăng nhập | `review` |  |
| `POST` | `/api/v1/study/sessions` | Đăng nhập | `createSession` |  |
| `GET` | `/api/v1/study/stats` | Đăng nhập | `getStats` |  |

### Góc nhìn & Tổng quan

| Phương thức | Đường dẫn | Quyền | Hàm xử lý | Ghi chú |
|---|---|---|---|---|
| `GET` | `/api/v1/views/kanban` | Đăng nhập | `getKanban` |  |
| `GET` | `/api/v1/views/calendar` | Đăng nhập | `getCalendar` |  |
| `GET` | `/api/v1/views/summary` | Đăng nhập | `getSummary` |  |
| `GET` | `/api/v1/dashboard/summary` | Đăng nhập | `getSummary` |  |

---

## 3. Quy tắc nghiệp vụ chính của API

**Object (Task / Note / Event / Reference)**
- `title` bắt buộc (≤ 255 ký tự). **Event** bắt buộc có `startAt`, và `endAt` (nếu có) phải sau `startAt`. **Reference** bắt buộc có `url` hợp lệ.
- `status` chỉ có ở Task (mặc định `TODO`); `priority` chỉ có ở Task và Event; `estimatedMinutes` (1–10080) chỉ có ở Task. Các ràng buộc này cũng được CSDL kiểm tra bằng `CHECK`.
- Không có luật "hạn chót/sự kiện không được ở quá khứ" và không ép thứ tự trạng thái — người dùng cần ghi lại việc đã xảy ra hoặc đã trễ.
- `PATCH /objects/:id` **không** đổi được `type` hay `lifecycle`; đổi loại dùng `convert-type`, đổi vòng đời dùng `lifecycle` (một nguồn sự thật duy nhất).

**Vòng đời:** `ACTIVE ⇄ ARCHIVED`, `→ TRASH` (soft delete) `→` xoá vĩnh viễn (chỉ được khi đang ở Thùng rác). Khôi phục từ Thùng rác về đúng trạng thái trước đó (Lưu trữ hoặc Hoạt động). Vào Thùng rác/Lưu trữ thì dọn các nhắc hạn chưa đọc.

**Space:** xoá Space chỉ gỡ Object ra (Object không mất; không còn Space nào thì về Hộp nhận). `settings` chỉ nhận cờ `enableKanban`, `enableCalendar`, `enableProgress` kiểu boolean. `GET /spaces/:id` kèm `progress {done, total}`.

**Liên kết (Relation):** 4 loại `RELATES_TO`, `REFERENCES`, `DEPENDS_ON`, `PARENT_OF`. `DEPENDS_ON`/`PARENT_OF` chỉ giữa các Task, **cấm tạo vòng** (kiểm tra bằng duyệt đồ thị), một việc chỉ có một việc cha. Không liên kết với mục trong Thùng rác. Liên kết có cờ `auto = true` được sinh tự động từ `[[Tiêu đề]]` trong nội dung và tự xoá khi không còn được nhắc.

**Lặp lại:** `recurrence {freq: DAILY|WEEKLY|MONTHLY, interval 1–52, until?}` chỉ cho Task (cần `dueDate`) và Event (cần `startAt`). Task lặp được đánh dấu xong → sinh lần kế tiếp (bỏ qua các lần đã lỡ); Event lặp → bộ quét sinh lần kế tiếp khi sự kiện đã bắt đầu.

**Phản hồi bổ sung khi `PATCH /objects/:id`:** `nextOccurrenceId` (đã sinh lần lặp kế tiếp) và `planningWarnings` (dời hạn làm trễ các việc đang chờ việc này).

**Học tập:** thẻ sinh từ dòng `Câu hỏi :: Trả lời` trong Note; ôn theo thuật toán SM-2 (4 mức chấm `AGAIN/HARD/GOOD/EASY`); thẻ của Note liên kết với việc sắp đến hạn (3 ngày) được xếp lên đầu.

**Thông báo:** quét mỗi 5 phút; chống trùng bằng `(user_id, dedupe_key)` duy nhất; giờ yên lặng; loại thông báo: `DEADLINE_SOON`, `OVERDUE`, `EVENT_SOON`, `DAILY_DIGEST` (07:00), `STUDY_DUE`, `UNBLOCKED`, `SYSTEM`.

**Admin:** chỉ thông tin tài khoản và số liệu tổng hợp — **không bao giờ** trả tiêu đề/nội dung/URL/tên Không gian của người dùng. Không tự khoá mình, không khoá Admin khác. Mọi hành động ghi vào nhật ký `admin_audit_logs`.

**Lịch `.ics`:** địa chỉ công khai bảo vệ bằng token bí mật 64 ký tự (tạo lại được để huỷ địa chỉ cũ); chỉ chứa tiêu đề.

**Xuất dữ liệu:** `GET /account/export` trả toàn bộ dữ liệu của chính người dùng, không chứa mật khẩu/token.

---

*Tài liệu tiếp theo trong chuỗi: [08_UI_UX_Design.md](08_UI_UX_Design.md)*
*Quay lại mục lục: [docs/README.md](README.md)*
