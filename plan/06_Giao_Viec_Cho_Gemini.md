# 06 — Giao việc cho AI khác (Gemini)

> Dùng file này làm prompt: **"Đọc `plan/06_Giao_Viec_Cho_Gemini.md` rồi làm Việc 1."** Mỗi lần giao **một việc**, làm xong và test xong mới sang việc kế tiếp.
> Cập nhật: 24/10/2026

---

## 0. Bối cảnh bắt buộc đọc

- Dự án: web quản lý học tập và công việc cá nhân. Backend NestJS 10 + Prisma 5 + PostgreSQL (`backend/`), frontend Next.js 14 App Router + TanStack Query + CSS Modules (`frontend/`).
- Mô hình dữ liệu: `Object` (TASK / NOTE / EVENT / REFERENCE) độc lập, gán vào nhiều `Space` qua `SpaceObject`, nối nhau bằng `ObjectRelation`. **Đã bỏ Tag và Space lồng nhau — không thêm lại.**
- Đọc trước: `plan/02_Quyet_Dinh.md` (các quyết định đã chốt), `backend/prisma/schema.prisma`, `backend/test/api.e2e-spec.ts` (mẫu viết test API), `frontend/components/ui/` (bộ component dùng chung).

### Quy tắc bắt buộc
1. **Mọi truy vấn dữ liệu người dùng phải lọc theo `userId` của người đang đăng nhập** (xem `objects.service.ts`). Sai chỗ này là lỗi bảo mật nghiêm trọng.
2. Đổi CSDL = tạo **migration mới** bằng `npx prisma migrate dev --name <ten>` trong `backend/`. **Cấm** `db push`, cấm sửa/xoá migration cũ. Ràng buộc `CHECK` viết tay trong file migration (xem `20261024000100_constraints`).
3. Giao diện: dùng component trong `frontend/components/ui/`, style bằng **CSS Modules** + biến màu trong `globals.css` (hỗ trợ sáng/tối). **Không** viết `style={{...}}` dài, không dùng `confirm()`/`alert()` (dùng `ConfirmDialog`/`useToast`). Gọi API qua hook TanStack Query trong `frontend/hooks/`, API client trong `frontend/lib/*-api.ts`.
4. **Thời gian**: dùng `frontend/lib/datetime.ts`. **Cấm** `toISOString().slice()/split()` để hiển thị (lỗi múi giờ đã từng làm lệch lịch).
5. Responsive: phải dùng được ở 375px, 768px, 1280px; không cuộn ngang cả trang.
6. Văn bản giao diện bằng tiếng Việt. Commit theo `docs/Workflow.md` (`[feat] ...`, `[fix] ...`). **Không `git push`.**
7. Không thêm thư viện lớn nếu không thật cần; nói rõ lý do nếu thêm.

### Lệnh hay dùng
```bash
docker compose up -d                       # bật CSDL (cổng 5435)
cd backend && npx prisma migrate dev --name ten_migration
cd backend && npx prisma migrate reset --force   # dựng lại CSDL dev + seed (tài khoản: demo@example.com / Password123! ; admin@example.com / Admin12345!)
cd backend && npm test                     # unit test
cd backend && npm run test:e2e             # test API (tự dựng CSDL study_work_test)
cd backend && npm run start:dev            # API: http://localhost:3001/api/v1 , Swagger: /api/docs
cd frontend && npm run dev                 # http://localhost:3000
cd frontend && npx tsc --noEmit && npm run build
```

### Điều kiện "xong" của mỗi việc
- `npm test`, `npm run test:e2e`, `npx tsc --noEmit` (cả 2 thư mục) và `npm run build` (cả 2) đều **xanh**.
- Có test mới cho **mọi luật nghiệp vụ** thêm vào (ghi rõ test nào trong báo cáo cuối).
- Tick `[x]` đúng mục trong `plan/03_Lo_Trinh.md`, thêm một mục vào `plan/05_Nhat_Ky.md`.
- Báo cáo cuối: liệt kê file đã tạo/sửa, test đã thêm, **những gì chưa làm hoặc chưa chắc**. Không ghi "hoàn thành 100%" nếu chưa tự chạy trên trình duyệt.

---

## Việc 1 — Hệ thống Thông báo (GĐ3, phần 1)  `M`

### Mục tiêu
Người dùng nhận thông báo nhắc việc sắp đến hạn / quá hạn / sự kiện sắp diễn ra, xem trong app qua chuông 🔔. Thiết kế dạng **bộ máy chung** (QD-12) để thêm loại/kênh sau này không phải sửa nhiều.

### Backend (`backend/src/notification/`, module mới đăng ký trong `app.module.ts`)
Bảng `notifications` đã có: `type`, `title`, `message`, `data(JSON)`, `dedupeKey` (**unique theo `userId + dedupeKey`**), `isRead`, `readAt`, `objectId`.

1. **Migration**: thêm bảng `notification_settings` (1 dòng / người dùng): `userId` (unique, FK cascade), `remindBeforeMinutes` Int mặc định 1440 (1 ngày), `quietHoursEnabled` Boolean mặc định false, `quietStart`/`quietEnd` (Int phút trong ngày, mặc định 1380 và 420 tức 23:00–07:00), `enableDeadline`, `enableOverdue`, `enableEvent` (Boolean, mặc định true). Tạo dòng mặc định khi đăng ký (hoặc tạo lười khi đọc lần đầu).
2. **API** (đều có `JwtAuthGuard`, đều lọc theo `userId`):
   - `GET /notifications?unreadOnly=` — danh sách, mới nhất trước, giới hạn 50; kèm `unreadCount`.
   - `GET /notifications/unread-count`
   - `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`
   - `DELETE /notifications/:id`
   - `GET /notifications/settings`, `PATCH /notifications/settings` (DTO có validate: `remindBeforeMinutes` 5…10080, giờ yên lặng 0…1439).
3. **Bộ quét định kỳ**: dùng `@nestjs/schedule` (cài thêm), `@Cron` mỗi 5 phút. `NotificationsService.scanAndCreate()` tách riêng để test được (nhận `now` làm tham số). Với **mỗi người dùng không bị khoá** (`lockedAt` null):
   - Task: `lifecycle=ACTIVE`, `status` ∉ {DONE, CANCELLED}, `dueDate` trong `(now, now + remindBefore]` → loại `DEADLINE_SOON`.
   - Task: tương tự nhưng `dueDate < now` → loại `OVERDUE`, mỗi task **chỉ báo 1 lần mỗi ngày** (dedupeKey chứa ngày địa phương).
   - Event: `lifecycle=ACTIVE`, `startAt` trong `(now, now + remindBefore]` → loại `EVENT_SOON`.
   - Bỏ qua loại người dùng đã tắt; **không tạo trong giờ yên lặng** (tính theo giờ Việt Nam UTC+7 — **dùng lại** `backend/src/common/timezone.ts`: `APP_TIMEZONE_OFFSET_MIN`, `toLocalDateKey`, `startOfLocalDay`; không tự định nghĩa lại).
   - `dedupeKey`: `DEADLINE_SOON:<objectId>:<dueDate ISO>`, `OVERDUE:<objectId>:<YYYY-MM-DD>`, `EVENT_SOON:<objectId>:<startAt ISO>`. Dùng `createMany({ skipDuplicates: true })` hoặc bắt lỗi P2002. **Đổi hạn chót ⇒ dedupeKey đổi ⇒ được báo lại; không báo trùng khi quét lại.**
   - Mục ở Thùng rác / Lưu trữ / đã xong **không** được báo. Khi task chuyển DONE, xoá các thông báo **chưa đọc** loại DEADLINE_SOON/OVERDUE của task đó (làm trong `ObjectsService.update` hoặc lắng nghe qua EventEmitter — chọn cách đơn giản, nhất quán).
4. **Bản tin buổi sáng** (làm sau khi phần trên chạy): cron 07:00 giờ VN, tạo 1 thông báo `DAILY_DIGEST` (dedupeKey theo ngày) gồm số việc đến hạn hôm nay, số sự kiện hôm nay, số việc quá hạn. Có công tắc `enableDigest` trong settings.

### Frontend
- `Header`: chuông hiện số chưa đọc (poll mỗi 60 giây bằng `refetchInterval`, tạm dừng khi tab ẩn), bấm mở dropdown 10 thông báo gần nhất, nút "Đánh dấu tất cả đã đọc", "Xem tất cả". **Bỏ chấm đỏ cố định.**
- Trang `/notifications`: danh sách đầy đủ, lọc Tất cả/Chưa đọc, đánh dấu đã đọc, xoá, bấm vào thì mở `ObjectDetailDrawer` của mục liên quan (nếu mục đã bị xoá thì hiện "Mục không còn tồn tại").
- Trang cài đặt thông báo: đặt tại `/profile` (thêm tab hoặc khối "Thông báo") gồm các công tắc và ô chọn "Nhắc trước" (15 phút / 1 giờ / 1 ngày / 3 ngày), giờ yên lặng.
- Thêm vào `MobileNav`/`Sidebar` nếu phù hợp.

### Test bắt buộc
- Unit test `scanAndCreate(now)` với dữ liệu giả: tạo đúng loại; **quét 2 lần không tạo trùng**; đổi `dueDate` thì báo lại; task DONE/CANCELLED/Thùng rác/Lưu trữ không báo; trong giờ yên lặng không tạo; tắt loại thì không tạo; người dùng bị khoá bị bỏ qua.
- Test API: A không đọc/đánh dấu/xoá được thông báo của B (404); `read-all` chỉ ảnh hưởng thông báo của mình.

---

## Việc 2 — Phân hệ Quản trị Admin (GĐ3, phần 2)  `M`

### Nguyên tắc (QD-11)
Admin quản lý **hệ thống**, **không đọc được nội dung cá nhân**. Mọi API admin **tuyệt đối không trả** `title`, `description`, `url`, `metadata`, tên Space, nội dung thông báo của người dùng — chỉ trả email, tên hiển thị, ngày tạo, đăng nhập cuối, và **con số tổng hợp**.

### Backend (`backend/src/admin/`)
- `RolesGuard` + decorator `@Roles('ADMIN')` (dùng `req.user.role` đã có trong `JwtStrategy`). Tất cả route dưới `/admin/*` phải qua `JwtAuthGuard` rồi `RolesGuard`. Người thường gọi → **403**.
- API:
  - `GET /admin/users?search=&page=&pageSize=` — `id, email, fullName, role, createdAt, lastLoginAt, lockedAt, spacesCount, objectsCount`. Phân trang, `pageSize` tối đa 50.
  - `PATCH /admin/users/:id/lock` và `/unlock` — **không được tự khoá chính mình**, **không khoá được Admin khác** (trả 400 kèm lý do). Khoá xong thì token cũ bị từ chối (đã có trong `JwtStrategy`).
  - `GET /admin/stats` — tổng người dùng, người dùng hoạt động 7 ngày (`lastLoginAt`), tổng Object theo loại, tổng Space, 14 ngày gần nhất: số người đăng ký mới và số Object tạo mới theo ngày (giờ VN).
  - `POST /admin/broadcast` — `{ title, message }` (giới hạn độ dài), tạo thông báo loại `SYSTEM` cho **mọi người dùng không bị khoá** (dùng `createMany`, `dedupeKey` = `SYSTEM:<id lần phát>`). Trả số người nhận. (Phụ thuộc Việc 1.)
- Ghi log hành động quản trị (ai khoá ai, lúc nào) bằng `Logger` là đủ; nếu muốn lưu CSDL thì thêm bảng `admin_audit_logs` bằng migration.

### Frontend (`frontend/app/(dashboard)/admin/`)
- Chỉ hiện với `role === 'ADMIN'`; người thường vào `/admin` thì chuyển về `/` kèm toast. **Bật lại** mục "Khu vực Quản trị" trong `Header.tsx` (đang bị tắt bằng `{false && ...}` có comment `TODO(GĐ3)`).
- Tab **Người dùng**: bảng (trên điện thoại chuyển sang dạng thẻ), ô tìm kiếm, phân trang, nút Khoá/Mở khoá có `ConfirmDialog`.
- Tab **Thống kê**: các thẻ số + biểu đồ cột/đường 14 ngày (tự vẽ bằng SVG/CSS, **không thêm thư viện biểu đồ nặng**; nếu cần thì chỉ `recharts`).
- Tab **Thông báo hệ thống**: form gửi broadcast, xác nhận trước khi gửi.

### Test bắt buộc
- Test API: user thường → 403 ở **mọi** route admin; admin gọi được; **response không chứa** các trường nội dung cá nhân (assert bằng cách kiểm tra khoá của object trả về); không tự khoá mình / khoá admin khác; người bị khoá không đăng nhập và token cũ bị 401; broadcast không gửi cho người bị khoá.

---

## Việc 3 — Hoàn thiện Space (phần còn thiếu của GĐ2 / QD-03)  `S–M`

Backend đã có `goal`, `dueDate`, `settings` trên `Space`; `SpaceObject` đã có `position`, `isPinned`. **Chưa có giao diện / API cho:**
1. Trang `/spaces/[id]`: hiện **mục tiêu** và **hạn chót** của Space (sửa tại chỗ), **thanh tiến độ** = số Task DONE / (số Task không tính CANCELLED) trong Space đó (tính ở backend trong `GET /spaces/:id`, trả thêm `progress: { done, total }`).
2. **Ghim** Object trong Space: `PATCH /spaces/:spaceId/objects/:objectId` `{ isPinned?, position? }` (kiểm tra Space thuộc user và mục nằm trong Space); mục ghim hiển thị trên cùng.
3. **Kéo thả sắp xếp** thứ tự trong danh sách (dùng HTML5 drag & drop hoặc nút ↑↓ nếu kéo thả khó trên mobile), lưu `position`.
4. **Công cụ bật/tắt** theo Space (`settings.enableKanban`, `enableCalendar`, `enableProgress`): menu "Công cụ" trong Space; các tab Kanban/Lịch chỉ hiện khi bật. Mặc định bật Danh sách + Kanban + Lịch cho Space mới.
5. Test: ghim/đổi thứ tự chỉ làm được trong Space của mình; tiến độ tính đúng (bỏ CANCELLED, mục Thùng rác không tính).

---

## Việc 4 — Kiểm thử thủ công & báo cáo lỗi (không sửa code)  `S`

Chạy app, đi theo checklist, **chỉ ghi lỗi vào `plan/07_Loi_Tim_Thay.md`** (mô tả, các bước tái hiện, mức độ), không tự sửa:
- Kịch bản demo chính: tạo Note "JWT" → gán 2 Space → sửa ở Space này thấy đổi ở Space kia → liên kết với Task → chuyển vào Thùng rác → khôi phục → xoá vĩnh viễn.
- Đủ 4 loại Object (tạo / sửa / chuyển loại); Kanban kéo thả; Lịch tuần + tháng (kiểm tra **đúng ngày** với việc hạn 23:30 và 00:30); Hộp nhận; Lưu trữ Space và khôi phục; đổi mật khẩu; hết phiên đăng nhập.
- Ở 3 cỡ màn hình (375 / 768 / 1280) và 2 chế độ sáng/tối; bàn phím (Tab, Enter, Esc).
- Tài khoản: `demo@example.com` / `Password123!`.

---

## Việc 5–7 — Ba trụ của đề tài (làm sau khi Việc 1–3 xong, mỗi việc giao riêng)

Chỉ nêu hướng; khi giao sẽ viết spec chi tiết như trên.

- **Việc 5 — Trụ Kế hoạch (GĐ4):** `DEPENDS_ON` có ý nghĩa: cấm nối vòng (duyệt đồ thị khi tạo), việc bị chặn hiện 🔒, cảnh báo khi đánh dấu xong việc còn bị chặn, thông báo "đã được mở khoá"; `PARENT_OF` = việc con, tiến độ việc cha tự tính; gợi ý **"Hôm nay làm gì?"** (chấm điểm theo độ gấp + ưu tiên + có bị chặn không, kèm lý do). Thêm `estimatedMinutes` cho Task.
- **Việc 6 — Trụ Học tập (GĐ5):** thẻ hỏi–đáp từ Note (cú pháp `Câu hỏi :: Trả lời`), ôn tập ngắt quãng **SM-2** (bảng thẻ + lịch sử ôn, test thuật toán bằng chuỗi điểm mẫu), phiên ôn lật thẻ, Pomodoro ghi thời gian học thật, thống kê.
- **Việc 7 — Trụ Tri thức (GĐ6):** gõ `[[` để liên kết nhanh, backlink trong Drawer, bản đồ tri thức (nút = Object, cạnh = liên kết, lọc theo Space/loại).

> Mỗi việc giao riêng để tiết kiệm token; nên bắt đầu phiên mới với câu: "Đọc `plan/06_Giao_Viec_Cho_Gemini.md` mục 0 và Việc N rồi làm."
