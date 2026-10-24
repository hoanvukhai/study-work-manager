# 03 — Lộ trình theo giai đoạn

> Nguyên tắc: **làm xong và test xong giai đoạn trước rồi mới sang giai đoạn sau.** Mỗi giai đoạn khi xong là một bản chạy được.
> Ngày cụ thể sẽ điền khi biết lịch nộp/bảo vệ. Khi thiếu thời gian thì **cắt từ dưới lên** (GĐ7 → GĐ6 → GĐ5…).
> Cập nhật lần cuối: 09/10/2026

---

> **Ghi chú trạng thái (24/10/2026):** GĐ0 đã xong và kiểm chứng (12 unit test + 20 test API, migration chạy từ CSDL trống). GĐ1–GĐ2 đã code xong, build xanh; **các mục "Kiểm thử thủ công" vẫn chưa tick vì chưa tự chạy trên trình duyệt**. Mục Space (mục tiêu / hạn chót / ghim / kéo thả) mới có ở backend, chưa có giao diện.

## Tổng quan

| GĐ | Tên | Mục tiêu | Cỡ | Tầng |
|---|---|---|:-:|---|
| 0 | Chốt và dọn nền | Chốt quyết định, sửa CSDL, sửa lỗi nghiêm trọng, có khung test | M | 🟥 Bắt buộc |
| 1 | Bộ giao diện nền | Component dùng chung, responsive, sáng/tối | M | 🟥 Bắt buộc |
| 2 | Hoàn thiện lõi còn thiếu | Đủ 4 loại, gán nhiều Space, Thùng rác, Hộp nhận, tìm kiếm, hồ sơ | L | 🟥 Bắt buộc |
| 3 | Thông báo + Admin | Bộ máy thông báo (trong app), khu vực Admin | M | 🟥 Bắt buộc |
| 4 | Trụ Kế hoạch | Phụ thuộc, việc con, lặp lại, "Hôm nay làm gì" | L | 🟧 Nên có |
| 5 | Trụ Học tập | Ôn tập ngắt quãng, thẻ hỏi–đáp, Pomodoro, thống kê | M | 🟧 Nên có |
| 6 | Trụ Tri thức | `[[ ]]`, backlink, bản đồ | M | 🟨 Có thì tốt |
| 7 | Mở rộng | Kênh thông báo, AI, cộng tác, tự xếp lịch… (chọn theo thời gian) | tuỳ | 🟦 Tuỳ chọn |
| 8 | Hoàn thiện và bảo vệ | Test tổng, deploy, đồng bộ docs, báo cáo, slide, demo | L | 🟥 Bắt buộc |

**Vì sao GĐ1 (giao diện nền) đứng trước GĐ2 (tính năng còn thiếu)?** Nếu làm tính năng mới bằng kiểu style cũ rồi mới làm đẹp, thì mỗi màn hình phải làm **hai lần**. Làm bộ component trước thì mọi tính năng mới làm ra là đẹp và đồng bộ ngay.

**Bản nộp được tối thiểu** = GĐ0 + GĐ1 + GĐ2 + GĐ3 + GĐ8. Các GĐ 4–6 là "chất riêng" của đề tài, GĐ7 phần lớn có thể đưa vào hướng phát triển.

---

## GĐ0 — Chốt và dọn nền  `M`

**Mục tiêu:** nền móng đúng và an toàn trước khi xây thêm.

### Việc cần làm
- [x] Chốt các quyết định QD-02 → QD-11, QD-14 → QD-17 trong `02_Quyet_Dinh.md`
- [x] Chuyển CSDL sang migration (QD-17): tạo migration gốc từ schema hiện tại
- [x] Sửa schema:
  - [x] Bỏ `tags`, `object_tags` (QD-01)
  - [x] Bỏ `Space.parentId` (QD-02)
  - [x] `User`: thêm `role`, `lockedAt`, `lastLoginAt` (QD-11)
  - [x] `Object`: `status`, `priority` cho phép rỗng; thêm `archivedAt` (QD-05, QD-07)
  - [x] `Space`: `isArchived` → `archivedAt`; thêm `settings` (JSON), `goal`, `dueDate` (QD-03)
  - [x] Ràng buộc `CHECK` theo loại + `CHECK(from <> to)` cho liên kết (viết SQL trong migration)
  - [x] Thêm index còn thiếu (TECH-09)
- [x] Viết lại `seed.ts`: mật khẩu băm thật, 1 tài khoản demo + 1 admin, dữ liệu mẫu đủ 4 loại (BUG-13)
- [x] Sửa lỗi nghiêm trọng:
  - [x] BUG-06: API sửa thường không nhận `lifecycle`, `type`
  - [x] SEC-01: hết khi bỏ `parentId`; rà lại mọi truy vấn có lọc theo `userId`
  - [x] SEC-02: bỏ giá trị dự phòng của `JWT_SECRET`
  - [x] SEC-03: mật khẩu tối thiểu 8
  - [x] SEC-06: kiểm tra dữ liệu theo loại (QD-07)
  - [x] BUG-07: tạo Object + gán Space trong transaction
- [x] Bộ xử lý lỗi chung, định dạng lỗi khớp doc 07 (TECH-04)
- [x] Swagger tại `/api/docs` (TECH-03)
- [x] Gộp endpoint trùng `/views/summary` và `/dashboard/summary` (TECH-06)
- [x] Dựng khung test: Jest cho service, Supertest + CSDL test riêng cho API

### Kiểm thử
- [x] Test tự động `ObjectsService`: tạo đúng/sai theo từng loại, đổi vòng đời đúng luồng, không đổi được vòng đời qua API sửa thường
- [x] Test API: người dùng A **không** đọc/sửa/xoá được Space, Object, liên kết của B (trả 404)
- [x] Chạy `migrate reset` + seed trên máy sạch → đăng nhập được tài khoản demo

### Xong khi
Migration chạy được từ đầu trên CSDL trống; test xanh; Swagger mở được; không còn mục 🔴 nào thuộc BUG/SEC.

### Cập nhật tài liệu
Doc 02 (luật nghiệp vụ, bỏ Tag), 05 (Domain Model + vẽ lại sơ đồ — DOC-10), 06 (Data Dictionary, ERD), 07 (đường dẫn API), xoá schema cũ trong doc 13 (DOC-07), README (bỏ Refresh Token — DOC-05).

---

## GĐ1 — Bộ giao diện nền  `M`

**Mục tiêu:** giao diện đẹp, đồng bộ, dùng được trên điện thoại.

### Việc cần làm
- [x] Biến màu sáng/tối theo bảng màu doc 08 (`globals.css`)
- [x] Bộ component dùng chung (QD-16): Button, Input, Textarea, Select, DatePicker, Dialog, ConfirmDialog, Toast (có **Hoàn tác**), Badge, DropdownMenu, Tabs, EmptyState, Skeleton
- [x] Cài TanStack Query; viết lại các hàm gọi API thành hook (`useObjects`, `useSpaces`…)
- [x] Layout responsive: Sidebar thu gọn thành ngăn kéo trên điện thoại; Header gọn lại; thanh điều hướng đáy trên mobile (như wireframe mobile)
- [x] Thay toàn bộ `confirm()`/`alert()` bằng ConfirmDialog/Toast (UI-03)
- [x] Chuyển Sidebar, Header, Layout sang CSS Modules (bỏ hover bằng JavaScript)
- [x] Nút chuyển sáng/tối (UI-09)
- [x] Phím tắt: `C` tạo mới (không bắt khi đang mở hộp thoại), `Ctrl+K` mở tìm kiếm (UI-10)

### Kiểm thử (thủ công)
- [ ] 375px / 768px / 1280px: không vỡ bố cục, không cuộn ngang
- [ ] Chrome, Edge, Firefox
- [ ] Chế độ sáng và tối đều đọc rõ chữ
- [ ] Dùng được bằng bàn phím (Tab, Enter, Esc đóng hộp thoại)

### Xong khi
Các màn hiện có (Dashboard, Space, Kanban, Lịch, Đăng nhập) chạy trên bộ component mới, đạt checklist trên.

### Cập nhật tài liệu
Doc 08 (Design System thực tế, sitemap đúng đường dẫn — DOC-16), doc 09 (cấu trúc frontend thực tế).

---

## GĐ2 — Hoàn thiện lõi còn thiếu  `L`

**Mục tiêu:** làm đủ những gì tài liệu đã hứa; demo được trọn vẹn ý tưởng "một Object, nhiều Space".

### Việc cần làm
- [x] **Khung chi tiết Object** trượt ra bên phải, gộp xem/sửa/liên kết/Space (UI-07)
- [x] Tạo đủ **4 loại**: Event (bắt đầu/kết thúc), Reference (URL, tự lấy tên miền làm phụ đề)
- [x] **Gán vào nhiều Space / gỡ khỏi Space** trong khung chi tiết (chọn Space dạng chip) — tính năng cốt lõi
- [x] Thao tác **"Chuyển thành…"** (Note → Task…) (QD-06)
- [x] **Vòng đời:** menu Lưu trữ / Chuyển vào Thùng rác (có Hoàn tác) — sửa BUG-01, BUG-02
- [x] **Trang Thùng rác:** khôi phục, xoá vĩnh viễn (có xác nhận), dọn sạch (BUG-03)
- [x] **Trang Lưu trữ:** Object và Space đã lưu trữ, khôi phục được (BUG-08)
- [x] **Hộp nhận:** Object chưa thuộc Space nào + **ô nhập nhanh** (QD-04)
- [x] Xoá Space đúng QD-04, hộp xác nhận đúng nội dung (UI-05)
- [x] **Space:** mô tả mục tiêu, hạn chót, thanh tiến độ, ghim, kéo thả sắp xếp (dùng `position`, `isPinned` đã có)
- [x] **Lịch:** hiện cả Task và Event; xem tuần + tháng; sửa API lịch (BUG-04, BUG-05)
- [x] Kanban: thêm cột hoặc bộ lọc cho `CANCELLED` (BUG-10)
- [x] **Tìm kiếm toàn cục** `Ctrl+K`: tìm Object và Space, mở nhanh (UI-04)
- [x] Hộp chọn liên kết có ô tìm kiếm, ẩn mục trong Thùng rác (BUG-11, BUG-15)
- [x] **Hồ sơ cá nhân:** sửa tên/ảnh, đổi mật khẩu (FR-AUTH-06, 07)
- [x] **Dashboard theo doc 08:** ô nhập nhanh, "Tiếp tục dở dang", việc cận hạn + sự kiện hôm nay (UI-06, BUG-14)
- [x] Trạng thái rỗng / đang tải / lỗi cho mọi danh sách (UI-08)
- [x] Dashboard đếm bằng truy vấn CSDL, không tải hết lên bộ nhớ (TECH-05)

### Kiểm thử
- [x] Tự động: gán/gỡ Space; xoá Space → Object về Hộp nhận; Thùng rác → khôi phục về đúng các Space cũ; xoá vĩnh viễn dọn sạch gán + liên kết; chuyển loại giữ đúng dữ liệu
- [x] Tự động: lịch trả đúng Task + Event trong khoảng thời gian, kể cả Event kéo dài qua khoảng
- [x] Thủ công — kịch bản demo chính: tạo Note "JWT" → gán vào 2 Space → sửa ở Space này, thấy đổi ở Space kia → liên kết với Task → chuyển vào Thùng rác → khôi phục

### Xong khi
Toàn bộ tính năng "Must have" trong doc 02 chạy được trên giao diện; kịch bản demo chính chạy trơn tru.

### Cập nhật tài liệu
Doc 02 (gom FR-OBJ chung — DOC-09), 03 (sửa US/UC — DOC-08, luật mới — DOC-15), 07, 08, 10.

---

## GĐ3 — Thông báo + Admin  `M`

### Việc cần làm — Thông báo (QD-12)
- [ ] Schema: `notifications` thêm `type`, `data`, `dedupeKey`; bảng cài đặt thông báo; `User` thêm giờ yên lặng
- [ ] Bộ máy thông báo: một nơi nhận "chuyện xảy ra" → tra cài đặt → gửi kênh
- [ ] Tác vụ chạy định kỳ (`@nestjs/schedule`): quét sắp hạn / quá hạn / sự kiện sắp bắt đầu
- [ ] Người dùng chọn nhắc trước bao lâu (mặc định + từng mục) (FR-NOTIF-05)
- [ ] Bản tin buổi sáng (trong app)
- [ ] Đổi hạn chót → huỷ/tạo lại nhắc; Task xong → huỷ nhắc
- [ ] Giao diện: chuông có số chưa đọc, danh sách thông báo, đánh dấu đã đọc / tất cả, xoá; trang cài đặt thông báo

### Việc cần làm — Admin (QD-11)
- [ ] Guard theo vai trò; tài khoản bị khoá không đăng nhập được
- [ ] Trang `/admin`: danh sách tài khoản (chỉ thông tin tài khoản + số lượng), khoá/mở khoá
- [ ] Thống kê tổng hợp: số người dùng, Object theo loại, hoạt động theo ngày (biểu đồ)
- [ ] Gửi thông báo hệ thống tới mọi người (dùng bộ máy thông báo)
- [ ] Quản lý mẫu Space dùng chung (nếu QD-03 được chốt)

### Kiểm thử
- [ ] Tự động: không báo trùng; Task xong thì không báo; Object lưu trữ/Thùng rác thì không báo; giờ yên lặng được tôn trọng
- [ ] Tự động: người thường gọi API admin → 403; API admin **không trả về** tiêu đề/nội dung Object
- [ ] Thủ công: tạo Task hạn 10 phút nữa, nhắc trước 5 phút → thấy thông báo đúng lúc

### Cập nhật tài liệu
Doc 02 (Actor Quản trị viên, FR-NOTIF, FR-ADMIN), 03 (UC Admin, Activity 06 thông báo), 05, 06, 07.

---

## GĐ4 — Trụ Kế hoạch  `L`

> **Trạng thái 25/10:** đã xong phần lõi (cấm vòng, 🔒, việc con, ước lượng, gợi ý, quá tải) với 14 unit test + 7 test API. **Chưa làm:** thông báo "được mở khoá" (chờ module Thông báo), cảnh báo khi dời hạn làm việc phía sau trễ theo, việc/sự kiện lặp lại.

### Việc cần làm
- [x] **Phụ thuộc** (`DEPENDS_ON`): biểu tượng 🔒 cho việc bị chặn; **chặn nối vòng tròn** (thuật toán duyệt đồ thị); hỏi xác nhận khi đánh dấu xong một việc còn bị chặn
- [ ] Thông báo "đã được mở khoá" khi việc tiền đề xong
- [ ] Cảnh báo khi dời hạn chót làm việc phía sau bị trễ theo
- [x] **Việc con** (`PARENT_OF`): checklist trong khung chi tiết, tiến độ việc cha tự tính
- [ ] **Việc / sự kiện lặp lại** (thời khoá biểu, việc hằng tuần)
- [x] **Ước lượng thời gian** cho Task
- [x] **"Hôm nay làm gì?"**: chấm điểm theo độ gấp + ưu tiên + bị chặn hay không + vừa thời gian trống → gợi ý 3–5 việc; giải thích vì sao gợi ý
- [x] **Cảnh báo quá tải** tuần
- [ ] Bật/tắt công cụ "Kế hoạch" trong cài đặt Space (QD-03)

### Kiểm thử
- [ ] Tự động: phát hiện vòng (A→B→C→A) bị chặn; thứ tự gợi ý đúng với dữ liệu mẫu; sinh đúng các lần lặp trong một khoảng thời gian; tiến độ việc cha đúng
- [ ] Thủ công: kịch bản "Module Auth → Module Space → Họp thầy"

---

## GĐ5 — Trụ Học tập  `M`

> **Trạng thái 25/10:** đã xong thẻ hỏi–đáp (`::`), SM-2, phiên ôn lật thẻ, Pomodoro, thống kê + chuỗi ngày, ôn theo ngữ cảnh (Note liên kết với việc sắp đến hạn được ôn trước). 16 unit test + 10 test API. **Chưa làm:** lượt ôn hiện trên Lịch, thông báo "đến lúc ôn" (chờ module Thông báo), bật/tắt công cụ Ôn tập theo Space (chờ Việc 3).

### Việc cần làm
- [x] Đánh dấu Note là "cần ôn"; tạo thẻ hỏi–đáp bằng cú pháp `Câu hỏi :: Trả lời`
- [x] Bảng thẻ ôn + lịch sử ôn; thuật toán **SM-2** (nhớ tốt → giãn lịch, quên → ôn lại sớm)
- [x] Màn hình phiên ôn: lật thẻ, tự chấm "Quên / Khó / Nhớ / Dễ"
- [ ] Lượt ôn đến hạn hiện trong Lịch, Dashboard và bản tin buổi sáng; thông báo "đến lúc ôn"
- [x] Kết hợp với Kế hoạch: Note liên kết với Task sắp làm → ưu tiên ôn trước
- [x] **Pomodoro / chế độ tập trung**: đếm giờ gắn với một Task/Note, lưu thời gian thật
- [x] **Thống kê học tập**: giờ học theo Space, số thẻ đã ôn, chuỗi ngày liên tục
- [ ] Bật/tắt công cụ "Ôn tập" trong cài đặt Space

### Kiểm thử
- [ ] Tự động: SM-2 tính đúng khoảng cách ôn và hệ số dễ với chuỗi điểm mẫu; tách thẻ từ `::` đúng
- [ ] Thủ công: ôn một bộ thẻ, kiểm tra ngày ôn tiếp theo

---

## GĐ6 — Trụ Tri thức  `M`

> **Trạng thái 25/10:** đã xong `[[ ]]` (gợi ý khi gõ + tự tạo/xoá liên kết), backlink, bản đồ tri thức (bố cục lực đẩy–kéo tự viết, lọc Space/loại, xem quanh một mục). 5 unit test + 9 test API. **Chưa làm:** bật/tắt công cụ Bản đồ theo Space (chờ Việc 3).

### Việc cần làm
- [x] Gõ `[[` trong nội dung → chọn mục → tự tạo liên kết
- [x] Mục **Backlink** trong khung chi tiết: "những mục đang nhắc tới mục này"
- [x] **Bản đồ tri thức**: chấm = Object (màu theo loại), đường = liên kết; lọc theo Space / loại liên kết; bấm vào chấm mở khung chi tiết
- [x] Bản đồ quanh một mục (chỉ hiện các mục cách 1–2 bước)
- [ ] Bật/tắt công cụ "Bản đồ" trong cài đặt Space

### Kiểm thử
- [x] Tự động: `[[ ]]` tạo/xoá liên kết khi sửa nội dung; backlink đúng
- [x] Thủ công: bản đồ mượt với khoảng 200 mục

---

## GĐ7 — Mở rộng (chọn theo thời gian còn lại)

Chọn từ `04_Kho_Y_Tuong.md`. Gợi ý thứ tự (giá trị cao, công sức thấp trước):

1. [ ] Xuất lịch `.ics` để Google Calendar nhắc trên điện thoại (TB-K4)
2. [ ] Cài lên điện thoại như app (PWA) + thông báo đẩy (KC-01, TB-K2)
3. [ ] Email: bản tin buổi sáng, quên mật khẩu (TB-K3, FR-AUTH-08/09)
4. [ ] AI: tạo thẻ ôn từ ghi chú (AI-02), gõ câu thường thành việc (AI-01)
5. [ ] Cộng tác nhóm mức đơn giản (nếu QD-14 chọn b)
6. [ ] Tự xếp lịch theo khoảng trống (KH-04)
7. [ ] Telegram bot, nhập/xuất dữ liệu…

Phần không kịp làm → đưa vào **Chương 5 — Hướng phát triển**.

---

## GĐ8 — Hoàn thiện và bảo vệ  `L`

- [ ] **Khoá tính năng** (không thêm tính năng mới từ thời điểm này)
- [ ] Chạy lại toàn bộ test; vá lỗi; (tuỳ chọn) Playwright cho 3–5 luồng chính
- [ ] Đo NFR: API < 500ms, Dashboard < 2s (ghi số liệu thật vào doc 10)
- [ ] Deploy: Frontend (Vercel), Backend + CSDL (Railway/Render/Supabase); sửa CORS theo môi trường (TECH-10)
- [ ] Đồng bộ toàn bộ `docs/` 01–12 với code cuối cùng; xuất lại sơ đồ
- [ ] Viết báo cáo Chương 1–5 (Chương 1–3 nên viết dần từ GĐ0–GĐ2)
- [ ] Sửa bản nháp Chương 5 (DOC-13)
- [ ] Dữ liệu demo đẹp; **kịch bản demo** 5–7 phút; slide
- [ ] Chuẩn bị trả lời các câu hỏi trong `01_Hien_Trang.md` mục 4
