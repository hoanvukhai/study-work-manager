# GĐ0 — Chốt và dọn nền

> Trạng thái: 🚀 **Hoàn thành xuất sắc Phiên 01 (Dọn nền tảng & Vá lỗi cốt lõi)**  
> Cập nhật lúc: 12/10/2026

---

## 1. Mục tiêu và Danh sách việc cần làm (Checklist)

- [x] Chốt các quyết định kiến trúc: QD-01, QD-02, QD-03, QD-04, QD-05, QD-06, QD-07, QD-08, QD-11, QD-14, QD-15, QD-16, QD-17
- [x] Sửa `schema.prisma`:
  - [x] Bỏ model `Tag`, `ObjectTag` (QD-01)
  - [x] Bỏ `parentId` trong `Space` (QD-02, triệt tiêu SEC-01, BUG-09)
  - [x] `User`: thêm `role` (Role enum USER/ADMIN), `lockedAt`, `lastLoginAt` (QD-11)
  - [x] `Object`: `status`, `priority` cho phép rỗng; thêm `archivedAt` (QD-05, QD-07)
  - [x] `Space`: `isArchived` → `archivedAt`; thêm `settings` (JSON), `goal`, `dueDate` (QD-03)
  - [x] Thêm index: `dueDate`, `startAt`, `space_objects(space_id, position)`, `object_relations(to_object_id)` (TECH-09)
  - [x] Sinh Prisma Client v5.22.0 thành công
- [x] Viết lại `seed.ts` bằng TypeScript: băm bcrypt thật, 1 user demo (`demo@example.com` / `Password123!`) + 1 admin (`admin@example.com` / `Admin12345!`), dữ liệu mẫu đầy đủ 4 loại (Task, Note, Event, Reference), demo multi-space (BUG-13, QD-17)
- [x] Sửa các lỗi nghiêm trọng Backend:
  - [x] **BUG-06:** API sửa Object (`UpdateObjectDto`) loại bỏ hoàn toàn `lifecycle` và `type`.
  - [x] **SEC-01:** Bỏ `parentId` trong Space, xử lý triệt để lỗi IDOR xem trộm Space con.
  - [x] **SEC-02:** Bỏ chuỗi dự phòng viết cứng `JWT_SECRET` trong `auth.module.ts` và `jwt.strategy.ts`, bắt buộc cấu hình biến môi trường.
  - [x] **SEC-03:** Nâng mật khẩu đăng ký tối thiểu từ 6 lên 8 ký tự trong `RegisterDto`.
  - [x] **SEC-06 & QD-07:** Kiểm tra nghiệp vụ theo loại (`EVENT` yêu cầu `endAt > startAt`, `REFERENCE` bắt buộc URL hợp lệ).
  - [x] **BUG-07:** Tạo Object + gán Space được gói trong `prisma.$transaction`.
  - [x] **BUG-05:** Viết lại truy vấn Lịch `/views/calendar`, khắc phục việc bị ghi đè key `OR` và lấy được Event bao trùm khoảng thời gian.
  - [x] **BUG-11:** Ẩn các đối tượng trong Thùng rác khỏi danh sách liên kết, chặn tạo liên kết với mục trong Thùng rác (QD-09).
  - [x] **BUG-14:** Bổ sung Event sắp diễn ra vào thống kê Dashboard `/dashboard/summary`.
  - [x] **TECH-06:** Gộp endpoint đồng thời hỗ trợ `/views/summary` và `/dashboard/summary`.
  - [x] **QD-11:** Bổ sung kiểm tra khóa tài khoản `lockedAt` trong JWT Strategy và cập nhật `lastLoginAt` khi đăng nhập.
- [x] **TECH-04:** Bộ xử lý lỗi chung `AllExceptionsFilter` (`src/common/filters/http-exception.filter.ts`) chuẩn hóa định dạng lỗi theo doc 07.
- [x] **TECH-03:** Tích hợp Swagger OpenAPI tại `/api/docs` (NFR-MAIN-02).
- [x] **TECH-02:** Dựng khung kiểm thử Jest cho NestJS (`ts-jest`), viết 10 unit test bao phủ toàn bộ logic mới, chạy xanh 100%.

---

## 2. Nhật ký chi tiết các phiên làm việc

### Phiên: 12/10/2026 (Phiên 01 — Dọn nền tảng & Vá lỗi cốt lõi)
- **Tóm tắt mục tiêu:** Thiết lập lại kiến trúc CSDL, sửa toàn bộ các lỗi BUG/SEC cấp bách theo sổ quyết định `02_Quyet_Dinh.md`, thêm Swagger, Exception Filter và kiểm thử tự động.
- **Chi tiết các file đã sửa & tạo mới:**
  1. `backend/prisma/schema.prisma`:
     - Xóa `Tag`, `ObjectTag`.
     - Xóa `Space.parentId`, `parent`, `children`.
     - Thêm `Role` enum, `User.role`, `lockedAt`, `lastLoginAt`.
     - Chuyển `Space.isArchived` thành `archivedAt`, thêm `settings`, `goal`, `dueDate`.
     - Đổi `Object.status`, `priority` thành nullable; thêm `archivedAt`.
     - Thêm các index hiệu năng: `dueDate`, `startAt`, `space_objects(space_id, position)`, `object_relations(to_object_id)`.
  2. `backend/src/auth/dto/register.dto.ts`: Nâng `@MinLength(8)` cho mật khẩu (SEC-03).
  3. `backend/src/auth/auth.module.ts`: Bỏ chuỗi secret fallback viết cứng (SEC-02).
  4. `backend/src/auth/strategies/jwt.strategy.ts`: Bỏ fallback secret, kiểm tra `user.lockedAt` để từ chối truy cập nếu bị khóa (SEC-02, QD-11).
  5. `backend/src/auth/auth.service.ts`: Cập nhật `lastLoginAt`, kiểm tra `lockedAt`, trả về trường `role`.
  6. `backend/src/object/dto/update-object.dto.ts`: Bỏ hoàn toàn trường `type` và `lifecycle` (BUG-06, QD-05).
  7. `backend/src/object/objects.service.ts`:
     - Gói tạo Object + gán Space vào `prisma.$transaction` (BUG-07).
     - Ràng buộc dữ liệu theo loại: `endAt > startAt` cho Event, URL cho Reference (SEC-06, QD-07).
     - Xử lý vòng đời `updateLifecycle`: gán `archivedAt` khi ARCHIVE, `deletedAt` khi TRASH, xóa mốc thời gian khi RESTORE.
  8. `backend/src/space/dto/create-space.dto.ts` & `update-space.dto.ts`: Bỏ `parentId`, thêm `settings`, `goal`, `dueDate`.
  9. `backend/src/space/spaces.service.ts`: Bỏ logic phân cấp cha-con, dùng `archivedAt`, hỗ trợ cài đặt Space.
  10. `backend/src/space/spaces.controller.ts`: Hỗ trợ `@Query('includeArchived')`.
  11. `backend/src/view/views.service.ts`: Sửa truy vấn Calendar OR logic (BUG-05), bổ sung Event vào Dashboard (BUG-14), hỗ trợ Space `archivedAt`.
  12. `backend/src/view/views.controller.ts`: Định tuyến mảng `@Get(['views/summary', 'dashboard/summary'])` (TECH-06).
  13. `backend/src/relation/relations.service.ts`: Ẩn mục Thùng rác khỏi liên kết (BUG-11), cấm liên kết mục trong Thùng rác (QD-09).
  14. `backend/src/common/filters/http-exception.filter.ts`: Tạo bộ lọc bắt mọi lỗi với định dạng `{ statusCode, message, errors, timestamp }` theo đúng doc 07 (TECH-04).
  15. `backend/src/main.ts`: Kích hoạt Swagger tại `/api/docs` và đăng ký `AllExceptionsFilter`.
  16. `backend/prisma/seed.ts`: Viết lại nạp dữ liệu TypeScript chuẩn với 2 tài khoản (Demo + Admin), 4 loại đối tượng, gán multi-space.
  17. `backend/package.json`: Cấu hình Jest `ts-jest`, cài `@nestjs/swagger` và `swagger-ui-express`.
  18. `backend/src/object/objects.service.spec.ts` & `src/space/spaces.service.spec.ts`: 10 bài unit test kiểm thử tự động.
- **Kết quả kiểm thử:**
  - `npm test` backend: **10/10 tests PASS (100% xanh)**.
  - `npm run build` backend: **Exit code 0 (thành công không lỗi)**.
  - `npm run build` frontend: **Exit code 0 (thành công không lỗi)**.
- **Việc phiên tiếp theo:**
  - Khởi tạo migration SQL chuẩn từ schema mới khi container DB chạy.
  - Bắt đầu bước vào **GĐ1 — Bộ giao diện nền (Component dùng chung, CSS Modules, Responsive, TanStack Query)**.
