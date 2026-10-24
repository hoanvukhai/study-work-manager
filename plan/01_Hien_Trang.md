# 01 — Đánh giá hiện trạng

> Đánh giá ngày 09/10/2026, dựa trên commit `098aa3d` (đọc toàn bộ `docs/`, `backend/`, `frontend/`, sơ đồ và wireframe).

---

## 1. Nhận định chung

- **Điểm mạnh:** ý tưởng lõi (Object độc lập + gán vào nhiều Space + liên kết) hợp lý; bộ tài liệu 01→12 có truy vết tốt; backend đã tách dữ liệu theo người dùng ở hầu hết chỗ.
- **Điểm yếu lớn:**
  1. Tài liệu mâu thuẫn với nhau và với code (còn dấu vết kiến trúc Lần 1, Lần 2).
  2. Những tính năng làm nên sự khác biệt **chưa có trên giao diện**: gán nhiều Space, Event/Reference, Thùng rác, Hộp nhận, Thông báo.
  3. Giao diện chưa responsive, style viết rải rác nên khó làm đẹp đồng bộ.
  4. Chưa có test, chưa có Admin.

---

## 2. Bảng tình trạng tính năng

✅ có và chạy được · 🟠 có một phần / có lỗi · ❌ chưa có

| Nhóm | Tính năng | Backend | Giao diện | Ghi chú |
|---|---|:-:|:-:|---|
| Tài khoản | Đăng ký / đăng nhập / đăng xuất | ✅ | ✅ | Mật khẩu tối thiểu 6 (docs ghi 8) |
| | Xem/sửa hồ sơ, đổi mật khẩu | ❌ | ❌ | FR-AUTH-06, 07 |
| | Quên mật khẩu qua email | ❌ | ❌ | FR-AUTH-08, 09 |
| | Admin | ❌ | ❌ | Chưa có vai trò (role) trong CSDL |
| Space | Tạo / đổi tên / xoá | ✅ | ✅ | Hộp xác nhận xoá ghi sai nội dung |
| | Lưu trữ Space | ✅ | 🟠 | Lưu trữ xong là **mất luôn**, không có chỗ xem lại/khôi phục |
| | Space lồng nhau | 🟠 | 🟠 | Có `parentId` nhưng lỗi bảo mật + Space con bị ẩn → dự kiến bỏ (QD-02) |
| Object | Task | ✅ | ✅ | |
| | Note | ✅ | ✅ | |
| | Event | ✅ | ❌ | Giao diện chỉ tạo được Task và Note |
| | Reference | ✅ | ❌ | |
| | Sửa Object | 🟠 | ✅ | API cho đổi `type`/`lifecycle` tuỳ ý (BUG-06) |
| Gán Space | Gán vào nhiều Space / gỡ khỏi Space | ✅ | ❌ | **Tính năng cốt lõi nhưng chưa có nút nào gọi** |
| | Hộp nhận (Object chưa thuộc Space nào) | ❌ | ❌ | Object mất Space thành "mất tích" |
| Vòng đời | Lưu trữ / Thùng rác / Khôi phục | 🟠 | ❌ | Giao diện đang **xoá cứng** (BUG-01) |
| | Trang Thùng rác | — | ❌ | Link ở Sidebar dẫn tới trang 404 |
| Liên kết | Tạo / xem 2 chiều / xoá | ✅ | ✅ | Hộp chọn tải toàn bộ Object, không tìm kiếm |
| Góc nhìn | Danh sách trong Space | ✅ | ✅ | Lọc/tìm làm ở phía trình duyệt |
| | Kanban | ✅ | ✅ | Trang Kanban chung "xoá" không gọi API (BUG-02) |
| | Lịch tuần | 🟠 | 🟠 | Chỉ hiện Task, **không có Event** |
| | Lịch tháng | ❌ | ❌ | UC-17 mô tả lịch tháng |
| Dashboard | Tổng quan | ✅ | 🟠 | Dùng 5 thẻ đếm số, ngược triết lý doc 08; "sắp đến hạn" thiếu Event |
| Thông báo | Nhắc hạn tự động | ❌ | ❌ | Chuông ở Header chỉ là hình, chấm đỏ cố định |
| Tìm kiếm | Tìm toàn cục (Ctrl+K) | 🟠 | ❌ | Ô tìm kiếm ở Header không làm gì |
| Tag | Gắn thẻ | ❌ | ❌ | Dự kiến bỏ (QD-01) |
| Hạ tầng | Migration CSDL | ❌ | — | Đang dùng `db push` |
| | Test tự động | ❌ | ❌ | Doc 10 mô tả test nhưng chưa có file nào |
| | Tài liệu API (Swagger) | ❌ | — | NFR-MAIN-02 |
| | Triển khai (deploy) | ❌ | ❌ | |

---

## 3. Danh sách vấn đề

### 3.1 Lỗi chức năng (BUG)

| Mã | Mức | Vấn đề | Vị trí |
|---|:-:|---|---|
| BUG-01 | 🔴 | Nút xoá trong Space gọi `deleteObject` = **xoá vĩnh viễn**, bỏ qua Thùng rác | `frontend/app/(dashboard)/spaces/[id]/page.tsx` dòng 145 |
| BUG-02 | 🔴 | Trang Kanban chung: "xoá" chỉ xoá trên màn hình, **không gọi API** → tải lại là hiện lại | `frontend/app/(dashboard)/kanban/page.tsx` dòng 48 |
| BUG-03 | 🟡 | Link "Thùng rác" dẫn tới trang không tồn tại (404) | `frontend/components/layout/Sidebar.tsx` |
| BUG-04 | 🟡 | Trang Lịch chỉ lấy Task, không có Event; không dùng API `/views/calendar` | `frontend/app/(dashboard)/calendar/page.tsx` dòng 26 |
| BUG-05 | 🟡 | API lịch: có 2 khoá `OR` (cái sau đè cái trước); Event kéo dài qua khoảng đang xem (bắt đầu trước `from`) bị bỏ sót | `backend/src/view/views.service.ts` dòng 61–71 |
| BUG-06 | 🔴 | API sửa Object cho đổi `type` và `lifecycle` tuỳ ý → có thể ra trạng thái mâu thuẫn (TRASH nhưng `deletedAt` rỗng; Task đổi sang Note vẫn giữ hạn chót) | `backend/src/object/objects.service.ts` dòng 115–120 |
| BUG-07 | ⚪ | Tạo Object rồi gán Space là 2 lệnh rời, không gói trong transaction | `backend/src/object/objects.service.ts` dòng 41 |
| BUG-08 | 🟡 | Space đã lưu trữ không có chỗ xem lại / khôi phục | Sidebar, trang Space |
| BUG-09 | ⚪ | Space con bị lọc mất khỏi Sidebar (`!s.parentId`) | `Sidebar.tsx` — sẽ hết khi bỏ Space lồng nhau |
| BUG-10 | ⚪ | Kanban bỏ qua Task trạng thái `CANCELLED` | `views.service.ts`, `KanbanBoard.tsx` |
| BUG-11 | ⚪ | Danh sách liên kết trả về cả Object đang ở Thùng rác | `backend/src/relation/relations.service.ts` |
| BUG-12 | ⚪ | Tạo Object ngoài Space xong thì tải lại cả trang | `frontend/components/layout/Header.tsx` dòng 233 |
| BUG-13 | ⚪ | `seed.sql` dùng mã băm mật khẩu giả → tài khoản mẫu không đăng nhập được | `backend/prisma/seed.sql` |
| BUG-14 | 🟡 | Dashboard "sắp đến hạn" không có Event (FR-DASH-01 yêu cầu cả Event) | `views.service.ts` |
| BUG-15 | ⚪ | Hộp chọn liên kết tải toàn bộ Object, không có ô tìm | `frontend/components/relations/ObjectRelationsModal.tsx` dòng 33 |

### 3.2 Bảo mật (SEC)

| Mã | Mức | Vấn đề | Vị trí |
|---|:-:|---|---|
| SEC-01 | 🔴 | `parentId` không kiểm tra chủ sở hữu, còn `children` lấy ra không lọc theo người dùng → người A gắn Space của mình vào Space của người B thì **B thấy Space của A** (lỗi IDOR) | `backend/src/space/spaces.service.ts` dòng 18, 28 |
| SEC-02 | 🟡 | Khoá bí mật JWT có giá trị dự phòng viết cứng trong code | `backend/src/auth/auth.module.ts` dòng 17, `strategies/jwt.strategy.ts` dòng 21 |
| SEC-03 | ⚪ | Mật khẩu tối thiểu 6 ký tự, tài liệu ghi 8 | `backend/src/auth/dto/register.dto.ts` dòng 8 |
| SEC-04 | ⚪ | Không giới hạn số lần đăng nhập sai | FR-AUTH-10 (Could have) |
| SEC-05 | ⚪ | Token lưu ở `localStorage` (có thể bị đánh cắp nếu web dính lỗi XSS) — chấp nhận được cho ĐATN, nhưng cần biết để trả lời hội đồng | `frontend/lib/api.ts` |
| SEC-06 | 🟡 | Chưa kiểm tra dữ liệu theo loại: `endAt > startAt`, URL hợp lệ cho Reference | `backend/src/object/dto/` |

### 3.3 Giao diện / trải nghiệm (UI)

| Mã | Mức | Vấn đề |
|---|:-:|---|
| UI-01 | 🔴 | **Không responsive** (0 media query): Sidebar cố định 240px, ô tìm kiếm cố định 320px → vỡ trên điện thoại. NFR-RESP-01 không đạt |
| UI-02 | 🟡 | 448 chỗ viết style trực tiếp (`style={{...}}`), hiệu ứng hover viết bằng JavaScript → khó làm đồng bộ, khó làm dark mode |
| UI-03 | 🟡 | Dùng hộp `confirm()` / `alert()` mặc định của trình duyệt (6 chỗ); nên dùng hộp thoại riêng và thông báo nhỏ có nút **Hoàn tác** |
| UI-04 | 🟡 | Ô tìm kiếm và chuông thông báo ở Header chỉ để trang trí |
| UI-05 | 🟡 | Hộp xác nhận xoá Space ghi "Dữ liệu sẽ bị xoá vĩnh viễn" (Sidebar) và "đưa về mục Chung" (trang Space) — sai và không thống nhất |
| UI-06 | ⚪ | Dashboard dùng 5 thẻ đếm số, trong khi doc 08 thiết kế: ô nhập nhanh, "tiếp tục dở dang", việc cận hạn, lịch hôm nay |
| UI-07 | 🟡 | Tạo / sửa / liên kết là 3 hộp thoại rời nhau → nên gộp thành **một khung chi tiết Object** (trượt ra bên phải) |
| UI-08 | 🟡 | Không có trạng thái rỗng / đang tải / lỗi thống nhất; nhiều chỗ `catch {}` nuốt lỗi im lặng |
| UI-09 | ⚪ | Dark mode có trong thiết kế nhưng chưa làm |
| UI-10 | ⚪ | Phím tắt `C` vẫn bắt khi đang mở hộp thoại; chưa có `Ctrl+K` |

### 3.4 Kỹ thuật / hạ tầng (TECH)

| Mã | Mức | Vấn đề |
|---|:-:|---|
| TECH-01 | 🟡 | Không có migration (dùng `db push`) → không truy vết được thay đổi CSDL, khó deploy |
| TECH-02 | 🔴 | Chưa có test nào — hội đồng chắc chắn hỏi |
| TECH-03 | 🟡 | Chưa có Swagger (NFR-MAIN-02) |
| TECH-04 | ⚪ | Chưa có bộ xử lý lỗi chung; định dạng lỗi khác với doc 07 |
| TECH-05 | ⚪ | Dashboard tải toàn bộ Task lên bộ nhớ rồi mới lọc/đếm |
| TECH-06 | ⚪ | Trùng endpoint: `/views/summary` và `/dashboard/summary` |
| TECH-07 | 🟡 | Giao diện tự gọi API thủ công ở từng trang → dữ liệu lệch giữa các trang, phải tải lại. Doc 09 ghi dùng TanStack Query nhưng chưa dùng |
| TECH-08 | ⚪ | Không có tầng Repository như NFR-MAIN-01 ghi → sửa NFR hoặc giải thích (Prisma đã đóng vai trò này) |
| TECH-09 | ⚪ | Thiếu index cho `dueDate`, `startAt`, `space_objects(space_id, position)`, `object_relations(to_object_id)` |
| TECH-10 | ⚪ | CORS viết cứng `localhost:3000` → phải sửa khi deploy |

### 3.5 Tài liệu mâu thuẫn / sai (DOC)

| Mã | Vấn đề | File |
|---|---|---|
| DOC-01 | Quy tắc xoá Space có **5 phiên bản khác nhau** (xoá hết nội dung / xoá Object mồ côi / Object về Unassigned / "xoá vĩnh viễn" / "về mục Chung") | 02, 03, 05, 07, giao diện |
| DOC-02 | Space lồng nhau: doc 01 ghi "không làm", nhưng schema, doc 05, API đều có | 01, 05, 06, 07 |
| DOC-03 | Lưu trữ: doc 02/03 dùng `archivedAt`; schema dùng `lifecycle` + `deletedAt`; Space dùng `isArchived` | 02, 03, 06 |
| DOC-04 | Liên kết: doc 02/03 ghi "nhãn tự do", doc 05/06 và code dùng 4 loại cố định | 02, 03, 05, 06 |
| DOC-05 | README, doc 10/11 ghi có Refresh Token — code không có | README, 10, 11 |
| DOC-06 | Đường dẫn API trong doc 07 khác code (gán Space, lấy liên kết); có endpoint chưa làm (timeline, unassigned, notifications, tags) | 07 |
| DOC-07 | Doc 13 chứa **schema cũ hoàn toàn khác** (INBOX/SOMEDAY, CHILD_OF/DUPLICATES), mật khẩu 6, đường dẫn psql bị hỏng ký tự | 13 |
| DOC-08 | Doc 03: trùng mã US-34/35/36; UC-09 ghi FR-REF-06 (đúng là FR-REF-07); link ảnh `03_UseCase_04_Task.png` hỏng | 03 |
| DOC-09 | FR lặp CRUD 4 lần cho Task/Note/Event/Ref và ghi "tạo Task **trong một Space**" — cách viết của kiến trúc cũ | 02 |
| DOC-10 | Sơ đồ Domain Model: có khoá ngoại (không nên); Object–Liên kết chỉ vẽ 1 đường (cần 2); Object–Tag vẽ sai bội số | `diagrams/05_Domain_Model` |
| DOC-11 | Doc 06 khai báo index và `CHECK(from<>to)` không có trong schema; con số "8 bảng" sẽ thay đổi | 06 |
| DOC-12 | Doc 10 mô tả test cụ thể nhưng không có file test | 10 |
| DOC-13 | Bản nháp Chương 5 còn mục tiêu cũ ("Quản lý Learning", "Calendar đồng bộ") | `report/drafts/ch5_conclusion.md` |
| DOC-14 | PP-01/PP-06 tuyên bố quá mức ("chưa hệ thống nào cho tự tổ chức") → dễ bị phản bác; cần viết lại định vị so với Notion/Capacities/Obsidian | 01 |
| DOC-15 | Luật không thực tế: "không tạo hạn chót/sự kiện ở quá khứ", "trạng thái chỉ đi Todo→Doing→Done" | 02, 03 |
| DOC-16 | Sitemap doc 08 (`/dashboard`, `/views/kanban`...) khác đường dẫn thật (`/`, `/kanban`) | 08 |
| DOC-17 | Doc 04 vẽ cấu trúc thư mục "dự kiến" khác thực tế (không có `modules/`, `placement/`, `notification/`) | 04 |

---

## 4. Câu hỏi hội đồng nhiều khả năng hỏi (chuẩn bị dần)

1. Ứng dụng này khác Notion / Todoist / Obsidian ở điểm nào?
2. Space khác Tag ở chỗ nào, khi một Object nằm được ở nhiều Space?
3. Vì sao gộp Task/Note/Event/Reference vào **một bảng**? Note có trạng thái TODO là sao?
4. Liên kết giữa các Object dùng để làm gì ngoài hiển thị?
5. Nhắc nhở hoạt động thế nào nếu người dùng không mở app?
6. Phần "học tập" trong đề tài nằm ở đâu?
7. Làm sao đảm bảo người này không xem được dữ liệu người kia? Admin có đọc được ghi chú cá nhân không?
8. Em kiểm thử thế nào? Có test tự động không?

Câu trả lời dự kiến sẽ được bổ sung vào `02_Quyet_Dinh.md` khi chốt từng quyết định.
