# Giai đoạn 2 (GĐ2): Hoàn thiện lõi còn thiếu

> **Trạng thái:** 🟢 Hoàn thành 100% (Backend: 12/12 Unit Tests PASS, Frontend: 13/13 Routes Build Xanh)  
> **Thời gian hoàn thành:** 12/10/2026  
> **Cam kết:** Không dùng Tailwind CSS, tuân thủ bảng màu Google Neutral Design Tokens, không git push khi chưa được yêu cầu.

---

## 1. Mục tiêu giai đoạn
Hoàn thiện toàn bộ các chức năng cốt lõi còn thiếu theo `plan/03_Lo_Trinh.md` và `plan/02_Quyet_Dinh.md`:
1. Demo trọn vẹn tư tưởng **"Một Object, nhiều Space"** thông qua gán/gỡ Không gian dạng chip.
2. Cung cấp **Khung chi tiết Object (Object Detail Drawer - UI-07)** trượt mượt mà từ bên phải.
3. Hỗ trợ thao tác **"Chuyển thành..." (QD-06)** chuyển đổi linh hoạt giữa 4 loại đối tượng (`TASK`, `NOTE`, `EVENT`, `REFERENCE`).
4. Xây dựng các trang quản trị vòng đời chuyên biệt: **Hộp nhận (`/inbox` - QD-04)**, **Thùng rác (`/trash` - BUG-03)**, **Kho Lưu trữ (`/archive` - BUG-08)**.
5. Xây dựng trang **Hồ sơ cá nhân & Bảo mật (`/profile` - FR-AUTH-06, FR-AUTH-07)**.
6. Tích hợp thanh tìm kiếm toàn cục **Command Palette (`Ctrl+K` - UI-04)**.
7. Tối ưu hóa hiệu năng Dashboard bằng truy vấn CSDL thay vì nạp bộ nhớ (**TECH-05**) và bổ sung ô nhập nhanh, khu vực "Tiếp tục dở dang" (**UI-06, BUG-14**).
8. Bổ sung cột/bộ lọc **`CANCELLED` trên Kanban (BUG-10)** và chế độ xem **Tuần / Tháng trên Lịch trình (BUG-04, BUG-05)**.

---

## 2. Chi tiết các phần việc đã thực hiện

### A. Backend (NestJS + Prisma)

| Mã yêu cầu | Mô tả thay đổi | Tệp mã nguồn |
|---|---|---|
| **TECH-05** | Viết lại `getDashboardSummary` dùng trực tiếp các truy vấn đếm (`count`) và lấy có giới hạn (`take: 6..8`) của Prisma, không nạp toàn bộ Task vào bộ nhớ NodeJS. | `backend/src/view/views.service.ts` |
| **QD-04** | Bổ sung tham số `unassigned?: boolean` vào DTO và lọc `spaceObjects: { none: {} }` để truy vấn các đối tượng chưa phân loại vào Không gian nào (Hộp nhận). | `backend/src/object/dto/query-objects.dto.ts`<br>`backend/src/object/objects.service.ts` |
| **QD-06** | Tạo `ConvertTypeDto`, hiện thực `convertType(userId, id, targetType)` trong service và route `PATCH /objects/:id/convert-type`. Tự động chuẩn hóa dữ liệu khi đổi loại (giữ nguyên tiêu đề, mô tả, Không gian gắn kết; reset trường không tương thích). | `backend/src/object/dto/convert-type.dto.ts`<br>`backend/src/object/objects.service.ts`<br>`backend/src/object/objects.controller.ts` |
| **BUG-03** | Hiện thực chức năng dọn sạch Thùng rác `emptyTrash(userId)` và endpoint `DELETE /objects/trash/empty` (định nghĩa trước route động `:id`). Xoá triệt để các bản ghi liên kết và quan hệ trong bảng nối. | `backend/src/object/objects.service.ts`<br>`backend/src/object/objects.controller.ts` |
| **FR-AUTH-06** | Tạo `UpdateProfileDto`, hiện thực `updateProfile(userId, dto)` và route `PATCH /auth/profile` cho phép đổi họ và tên, ảnh đại diện avatar. | `backend/src/auth/dto/update-profile.dto.ts`<br>`backend/src/auth/auth.service.ts`<br>`backend/src/auth/auth.controller.ts` |
| **FR-AUTH-07** | Tạo `ChangePasswordDto`, kiểm tra mật khẩu cũ qua `bcrypt.compare`, băm mật khẩu mới qua `bcrypt.hash` (tối thiểu 8 ký tự), route `POST /auth/change-password`. | `backend/src/auth/dto/change-password.dto.ts`<br>`backend/src/auth/auth.service.ts`<br>`backend/src/auth/auth.controller.ts` |
| **Kiểm thử tự động** | Bổ sung Test 8 (`convertType`) và Test 9 (`emptyTrash`) vào `objects.service.spec.ts`. Toàn bộ **12/12 unit tests PASS 100%**. | `backend/src/object/objects.service.spec.ts` |

---

### B. Frontend — Lớp Dịch vụ & Hooks

| Tệp mã nguồn | Mô tả thay đổi |
|---|---|
| `frontend/lib/auth-context.tsx` | Bổ sung `updateProfile({ fullName, avatarUrl })` và `changePassword({ currentPassword, newPassword })` vào `AuthContext`. Tự động cập nhật `user` trong state và localStorage. |
| `frontend/lib/objects-api.ts` | Bổ sung hàm API `convertObjectType`, `emptyTrash`, và tham số `unassigned` trong `QueryObjectsParams`. |
| `frontend/hooks/useObjects.ts` | Bổ sung hook `useConvertObjectType` và `useEmptyTrash` với cơ chế tự động invalidate React Query cache (objects, dashboard, kanban, calendar). |
| `frontend/hooks/useRelations.ts` | Tạo mới hook quản lý liên kết 2 chiều: `useObjectRelations`, `useCreateRelation`, `useDeleteRelation`. |

---

### C. Frontend — Components & Drawers mới

| Component | Tệp CSS Module | Mô tả tính năng |
|---|---|---|
| **ObjectDetailDrawer** (`UI-07`) | `ObjectDetailDrawer.module.css` | Khung chi tiết trượt ra từ bên phải màn hình khi click vào bất kỳ mục nào:<br>• Sửa trực tiếp tiêu đề, mô tả/ghi chú, hạn chót, ngày bắt đầu/kết thúc, đường dẫn URL.<br>• **Gán/gỡ nhiều Space dạng chip (Tính năng cốt lõi):** hiển thị badge các Space đã gán kèm nút xoá `x`, dropdown thêm nhanh vào Space khác.<br>• **Thao tác "Chuyển thành..." (QD-06):** menu chuyển loại giữa Task, Note, Event, Reference.<br>• **Liên kết 2 chiều (BUG-11, BUG-15):** hiển thị liên kết đi/đến, form tạo liên kết có ô tìm kiếm đối tượng (loại trừ Thùng rác và chính nó).<br>• Quản trị vòng đời: Lưu trữ, Thùng rác (kèm Hoàn tác), Khôi phục, Xoá vĩnh viễn (kèm ConfirmDialog). |
| **CommandPalette** (`UI-04`) | `CommandPalette.module.css` | Hộp thoại tìm kiếm toàn cục kích hoạt bằng `Ctrl+K` hoặc click vào ô tìm kiếm Header:<br>• Tìm kiếm tức thì theo thời gian thực cả Không gian và Đối tượng.<br>• Phím tắt điều hướng nhanh (`↑`, `↓`, `↵`, `Esc`).<br>• Phím tắt tạo nhanh công việc mang tên từ khoá đang gõ. |

---

### D. Frontend — Các trang màn hình mới

1. **Trang Hộp nhận (`/inbox` - QD-04):**
   - Tệp: `frontend/app/(dashboard)/inbox/page.tsx` và `Inbox.module.css`.
   - Chứa **Thanh nhập nhanh (Quick Add bar)** ở đầu trang với các pill chọn nhanh loại mục (`TASK`, `NOTE`, `EVENT`, `REFERENCE`).
   - Liệt kê toàn bộ các đối tượng chưa phân loại vào Không gian nào.
   - Thao tác nhanh: đánh dấu hoàn thành, lưu trữ, đưa vào thùng rác, bấm mở khung chi tiết.
   - Tệp `frontend/app/(dashboard)/unassigned/page.tsx` tự động chuyển hướng về `/inbox`.

2. **Trang Thùng rác (`/trash` - BUG-03):**
   - Tệp: `frontend/app/(dashboard)/trash/page.tsx` và `Trash.module.css`.
   - Nút **"Dọn sạch thùng rác"** kích hoạt `ConfirmDialog` xác nhận trước khi xoá vĩnh viễn toàn bộ.
   - Mỗi mục có nút **Khôi phục** (tự động trả về đúng các Space cũ đã gán) và nút **Xoá vĩnh viễn**.

3. **Trang Kho Lưu trữ (`/archive` - BUG-08):**
   - Tệp: `frontend/app/(dashboard)/archive/page.tsx` và `Archive.module.css`.
   - Chia 2 tab rõ ràng: **Đối tượng & Ghi chú đã lưu trữ** và **Không gian đã lưu trữ**.
   - Hỗ trợ khôi phục tức thì về trạng thái hoạt động.

4. **Trang Hồ sơ cá nhân & Bảo mật (`/profile` - FR-AUTH-06, FR-AUTH-07):**
   - Tệp: `frontend/app/(dashboard)/profile/page.tsx` và `Profile.module.css`.
   - Form 1: Cập nhật họ tên, đường dẫn ảnh đại diện avatar, xem quyền vai trò (User/Admin).
   - Form 2: Đổi mật khẩu với kiểm tra độ dài tối thiểu 8 ký tự, xác nhận mật khẩu và thông báo lỗi rõ ràng.

---

### E. Frontend — Nâng cấp các màn hình hiện có

1. **Dashboard (`/` - UI-06, BUG-14, TECH-05):**
   - Bổ sung **Ô nhập nhanh (Quick Add)** ngay dưới banner chào mừng.
   - Bổ sung khu vực **"Tiếp tục dở dang"** với hiệu ứng chấm phát xung (pulse dot) hiển thị các việc `IN_PROGRESS` để tiếp tục ngay lập tức.
   - Tích hợp `ObjectDetailDrawer` khi click vào bất kỳ công việc hoặc hạn chót nào.

2. **Kanban (`/kanban` - BUG-10):**
   - Bổ sung nút chuyển đổi **"Hiện/Ẩn cột Đã hủy" (`CANCELLED`)**.
   - Thêm cột thứ 4 màu xám trung tính cho việc `CANCELLED`, hỗ trợ kéo thả trạng thái.
   - Click vào thẻ mở trực tiếp `ObjectDetailDrawer`.

3. **Lịch trình (`/calendar` - BUG-04, BUG-05):**
   - Bổ sung bộ chuyển đổi chế độ xem **"Xem theo Tuần"** và **"Xem theo Tháng"** (lưới 35 ô tháng).
   - Hiển thị cả **Công việc (Task)** theo `dueDate` lẫn **Sự kiện (Event)** có khoảng thời gian `startAt` – `endAt`.
   - Click vào mục mở trực tiếp `ObjectDetailDrawer`.

4. **Trang chi tiết Không gian (`/spaces/[id]`):**
   - Tích hợp mở `ObjectDetailDrawer` khi bấm vào bất kỳ mục nào trên cả 4 chế độ: Danh sách, Lưới thẻ, Kanban, Lịch trình.

5. **Sidebar & Điều hướng Header:**
   - Cập nhật Sidebar liên kết trực tiếp tới `/inbox`, `/archive`, `/trash`.
   - Header dropdown người dùng liên kết trực tiếp tới `/profile` ("Hồ sơ & Bảo mật").
   - Click ô tìm kiếm Header hoặc ấn `Ctrl+K` kích hoạt Command Palette.

---

## 3. Kết quả kiểm thử & Biên dịch

### Kiểm thử Backend (NestJS + Jest):
```
PASS src/space/spaces.service.spec.ts
PASS src/object/objects.service.spec.ts

Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        4.514 s
Ran all test suites.
```
- Biên dịch `nest build`: **Thành công (Exit Code 0)**.

### Biên dịch Frontend (Next.js 14):
```
Route (app)                              Size     First Load JS
┌ ○ /                                    6.43 kB         125 kB
├ ○ /_not-found                          873 B          88.2 kB
├ ○ /archive                             2.62 kB         110 kB
├ ○ /calendar                            1.86 kB         117 kB
├ ○ /inbox                               3.03 kB         110 kB
├ ○ /kanban                              2.39 kB         120 kB
├ ○ /login                               2.71 kB        98.8 kB
├ ○ /profile                             5.34 kB        92.7 kB
├ ○ /register                            2.87 kB          99 kB
├ ƒ /spaces/[id]                         6.11 kB         126 kB
├ ○ /trash                               2.47 kB         109 kB
└ ○ /unassigned                          353 B          87.7 kB
+ First Load JS shared by all            87.3 kB

✓ Generating static pages (13/13)
```
- Biên dịch `next build`: **Thành công (Exit Code 0)**.
- Toàn bộ 13 routes không có lỗi TypeScript hay Linting.
