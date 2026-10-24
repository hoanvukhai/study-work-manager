# 05 — Nhật ký làm việc

> Ghi ngắn sau mỗi buổi làm: **làm gì · gặp vấn đề gì · xử lý thế nào · việc tiếp theo**.
> Mục "Vấn đề & cách xử lý" là nguyên liệu cho phần "Khó khăn và giải pháp" trong Chương 4 của báo cáo.

---

## Mẫu

```markdown
### DD/MM/YYYY — GĐx
- **Đã làm:** ...
- **Vấn đề & cách xử lý:** ...
- **Tiếp theo:** ...
```

---

### 09/10/2026 — Đánh giá tổng thể
- **Đã làm:** Đọc toàn bộ `docs/`, `backend/`, `frontend/`, sơ đồ, wireframe. Lập bộ sổ tay `plan/` (hiện trạng, quyết định, lộ trình, kho ý tưởng).
- **Vấn đề & cách xử lý:**
  - Tài liệu có nhiều chỗ mâu thuẫn do thiết kế đổi 3 lần (Lần 1 → Lần 3) mà chưa dọn hết → liệt kê thành các mục DOC-xx, sẽ sửa dần cuối mỗi giai đoạn.
  - Tính năng cốt lõi (gán nhiều Space) có API nhưng chưa có giao diện → đưa vào GĐ2.
  - Đã chốt bỏ Tag (QD-01); Space lồng nhau chốt tạm bỏ (QD-02).
- **Tiếp theo:** Chốt các quyết định còn chờ trong `02_Quyet_Dinh.md`, đánh giá các ý tưởng trong `04_Kho_Y_Tuong.md`, rồi bắt đầu GĐ0.

---

### 12/10/2026 — GĐ0 (Phiên 01)
- **Đã làm:** 
  - Khởi tạo thư mục theo dõi nhanh `progress/` (`00_Tong_Quan.md`, `GD0_Don_Nen.md`).
  - Cập nhật Prisma Schema theo các quyết định kiến trúc: bỏ `Tag`, bỏ `Space.parentId` (xóa triệt để SEC-01), thêm User `role` & `lockedAt` (QD-11), chuyển Space sang `archivedAt` và thêm `settings`/`goal`/`dueDate` (QD-03), cho phép `status`/`priority` nullable và thêm `archivedAt` cho Object (QD-05, QD-07), thêm các index hiệu năng (TECH-09). Sinh Prisma client thành công.
  - Viết lại `seed.ts` chuẩn TypeScript với bcrypt: 2 user (Demo + Admin), 4 loại Object, mô phỏng gán multi-space.
  - Sửa các lỗi nghiêm trọng backend: BUG-06 (loại bỏ `type`/`lifecycle` khỏi API update), SEC-02 (bỏ fallback JWT), SEC-03 (mật khẩu tối thiểu 8), SEC-06 (validate Event thời gian và Reference URL), BUG-07 (gói create Object + space vào transaction), BUG-05 (sửa logic Calendar OR), BUG-11 (ẩn mục Thùng rác khỏi liên kết), BUG-14 (bổ sung Event vào Dashboard), TECH-06 (hỗ trợ cả `/views/summary` và `/dashboard/summary`).
  - Thêm `AllExceptionsFilter` chuẩn hóa định dạng lỗi theo doc 07 (TECH-04), tích hợp Swagger tại `/api/docs` (TECH-03).
  - Dựng khung test Jest + `ts-jest`, viết 10 unit test cho ObjectsService và SpacesService — chạy xanh 10/10 tests (TECH-02).
  - Cả Backend và Frontend biên dịch build 100% thành công không có lỗi.
- **Vấn đề & cách xử lý:**
  - `@nestjs/swagger` cài mặc định kéo bản v12 dành cho NestJS 12 dẫn tới xung đột peer dependencies với NestJS 10 -> Cài đặt chỉ định `@nestjs/swagger@^7.4.2` tương thích hoàn hảo.
  - Jest ban đầu báo lỗi do thiếu cấu hình `ts-jest` trong `package.json` -> Đã bổ sung cấu hình module chuẩn của NestJS.
- **Tiếp theo:** Bước vào GĐ1 — Xây dựng bộ giao diện nền (Component dùng chung, CSS Modules, Responsive và TanStack Query).

---

### 12/10/2026 — GĐ1 (Phiên 02)
- **Đã làm:**
  - Hoàn thiện toàn bộ hệ thống Design Tokens màu sắc (Google Neutral Light & Google Dark theo Doc 08) trong `globals.css` cùng `ThemeProvider` tự động ghi nhớ tùy chọn vào `localStorage`.
  - Xây dựng trọn bộ 13 UI Components dùng chung (`frontend/components/ui/`): `Button`, `Input`, `Textarea`, `Select`, `DatePicker`, `Dialog`, `ConfirmDialog`, `Toast` (hỗ trợ Hoàn tác - Undo), `Badge`, `DropdownMenu`, `Tabs`, `EmptyState`, `Skeleton`.
  - Cài đặt `@tanstack/react-query@^5.28.4`, thiết lập `ReactQueryProvider` và viết toàn bộ các hook: `useSpaces`, `useObjects`, `useViews`.
  - Bố cục Responsive hoàn chỉnh: Sidebar thu gọn thành ngăn kéo trên mobile, Header gọn gàng, thanh điều hướng đáy `MobileNav` cho thiết bị di động `<= 768px`.
  - Loại bỏ hoàn toàn `confirm()` và `alert()` nguyên thủy (UI-03), thay thế bằng `ConfirmDialog` và `Toast`.
  - Sửa lỗi **BUG-01** (chuyển sang soft delete vào Thùng rác thay vì xóa cứng mất dữ liệu) và **BUG-02** (xóa trên Kanban gọi backend API thay vì chỉ xóa client-only).
  - Tích hợp phím tắt nhanh (UI-10): `C` tạo mới đối tượng, `Ctrl+K` mở tìm kiếm toàn cục, nút chuyển sáng/tối (UI-09).
  - Tái cấu trúc toàn bộ các trang: Dashboard, Kanban, Lịch, Chi tiết Space, Đăng nhập, Đăng ký sang CSS Modules và TanStack Query.
  - Cập nhật tài liệu tiến độ chi tiết `progress/GD1_Giao_Dien_Nen.md` và `progress/00_Tong_Quan.md`.
- **Vấn đề & cách xử lý:**
  - `Next.js 14` kiểm tra chặt chẽ kiểu type trong các component modal -> Chuẩn hóa các interface Props của `CreateObjectModal`, `ConfirmDialog`, `ObjectRelationsModal` hỗ trợ linh hoạt các biến thể props và alias.
  - Xung đột kiểu dữ liệu `priority: null` với enum `Priority` trên Kanban board -> Bổ sung kiểm tra an toàn `task.priority ? PRIORITY_CONFIG[task.priority] : null`.
- **Kết quả:**
  - `npm run build` Frontend: **Exit code 0 (100% thành công không lỗi)**.
  - `npm run build` Backend: **Exit code 0 (100% thành công không lỗi)**.
  - `npm test` Backend: **10/10 PASS**.
- **Tiếp theo:** Bước vào **GĐ2 — Hoàn thiện lõi còn thiếu** (Drawer chi tiết đối tượng trượt từ phải sang, gán nhiều Space, Thùng rác, Lưu trữ, Hộp nhận).

---

### 12/10/2026 — GĐ2 (Phiên 03)
- **Đã làm:**
  - **Backend:**
    - TECH-05: Tối ưu `getDashboardSummary` bằng truy vấn CSDL trực tiếp (đếm `count`, giới hạn `take: 6..8`), không nạp toàn bộ Task vào bộ nhớ.
    - QD-04: Thêm tham số `unassigned?: boolean` vào DTO và lọc `spaceObjects: { none: {} }` cho Hộp nhận.
    - QD-06: Viết DTO và endpoint `PATCH /objects/:id/convert-type` chuyển đổi linh hoạt giữa 4 loại Object (`TASK`, `NOTE`, `EVENT`, `REFERENCE`).
    - BUG-03: Viết endpoint `DELETE /objects/trash/empty` dọn sạch thùng rác và xóa triệt để liên kết quan hệ.
    - FR-AUTH-06, FR-AUTH-07: Viết DTO và các endpoint `PATCH /auth/profile` (cập nhật họ tên, avatar) và `POST /auth/change-password` (đổi mật khẩu bcrypt, tối thiểu 8 ký tự).
    - Viết thêm 2 unit test (Test 8 & Test 9) trong `objects.service.spec.ts` cho `convertType` và `emptyTrash` -> **12/12 unit tests PASS 100%**.
  - **Frontend:**
    - Cập nhật `AuthContext` với `updateProfile` và `changePassword`.
    - Viết hook `useRelations` (`useObjectRelations`, `useCreateRelation`, `useDeleteRelation`).
    - Xây dựng **`ObjectDetailDrawer` (UI-07)** trượt mượt mà từ cạnh phải: sửa trực tiếp, gán/gỡ nhiều Space dạng chip (tính năng cốt lõi), dropdown "Chuyển thành..." (QD-06), danh sách liên kết chéo 2 chiều kèm ô tìm kiếm đối tượng (BUG-11, BUG-15), quản lý vòng đời (Lưu trữ, Thùng rác có Hoàn tác, Khôi phục, Xoá vĩnh viễn).
    - Xây dựng **`CommandPalette` (UI-04)** tìm kiếm toàn cục `Ctrl+K` tức thì cả Không gian và Đối tượng kèm điều hướng bàn phím.
    - Xây dựng các trang mới:
      - `/inbox` (Hộp nhận - QD-04) với thanh nhập nhanh (Quick Add).
      - `/trash` (Thùng rác - BUG-03) với Dọn sạch thùng rác, Khôi phục (giữ nguyên Space cũ) và Xoá vĩnh viễn.
      - `/archive` (Kho Lưu trữ - BUG-08) tách 2 tab: Đối tượng đã lưu trữ & Không gian đã lưu trữ.
      - `/profile` (Hồ sơ & Bảo mật - FR-AUTH-06, 07) cập nhật thông tin cá nhân và đổi mật khẩu.
    - Nâng cấp các màn hình hiện có:
      - Dashboard (UI-06, BUG-14): thanh nhập nhanh, khu vực "Tiếp tục dở dang" có hiệu ứng pulse dot, click mở Drawer.
      - Kanban (BUG-10): nút chuyển đổi cột Đã hủy (`CANCELLED`), click mở Drawer.
      - Lịch trình (BUG-04, BUG-05): bộ chuyển đổi chế độ xem Tuần / Tháng, hiển thị cả Task và Event trải dài, click mở Drawer.
      - Chi tiết Không gian: tích hợp mở Drawer cho Danh sách, Lưới thẻ, Kanban, Lịch trình.
      - Sidebar & MobileNav: cập nhật đường dẫn tới `/inbox`, `/archive`, `/trash`, `/profile`.
  - Cập nhật tài liệu: `progress/GD2_Loi_Chuc_Nang.md`, `progress/00_Tong_Quan.md`, `plan/05_Nhat_Ky.md`.
- **Vấn đề & cách xử lý:**
  - Route tĩnh `trash/empty` trong NestJS nếu đặt sau route động `:id` sẽ bị nhầm lẫn `id = "trash"` -> Đã đặt `@Delete('trash/empty')` lên trước `@Delete(':id')`.
  - Type `ButtonProps` ban đầu chưa có variant `'outline'` mà chỉ có `'secondary'` -> Bổ sung `'outline'` vào `ButtonProps` và CSS Module alias với `.secondary`.
  - Next.js type check yêu cầu option cho toast undo khớp interface -> Mở rộng `ToastActionOptions` hỗ trợ cả `action: { label, onClick }` và `onUndo` linh hoạt.
- **Kết quả:**
  - `npm test` Backend: **12/12 PASS (100% xanh)**.
  - `npm run build` Backend: **Exit code 0 (100% thành công)**.
  - `npm run build` Frontend: **Exit code 0 (100% thành công, 13/13 static routes)**.
- **Tiếp theo:** Bước vào **GĐ3 — Thông báo & Quản trị Admin**.


---

### 24/10/2026 — Rà soát & sửa lỗi sau GĐ2
- **Đã làm:** Commit GĐ0–GĐ2 (3 commit). Sửa lỗi múi giờ (Drawer + Lịch), phiên đăng nhập 7 ngày + xử lý 401, bỏ 2 modal cũ, lịch cuộn ngang trên mobile. Backend: migration thật + CHECK theo loại, `@@unique([userId, dedupeKey])`, khôi phục Thùng rác về đúng trạng thái, chỉ xoá vĩnh viễn mục trong Thùng rác, Event/Reference bắt buộc trường chính, đăng nhập không lộ trạng thái khoá, Dashboard bỏ việc đã huỷ, filter lỗi không lộ chi tiết CSDL, bỏ controller trùng. Thêm 20 test API (cách ly dữ liệu A/B…). Viết `plan/06_Giao_Viec_Cho_Gemini.md`.
- **Vấn đề & cách xử lý:**
  - CSDL dev đang chạy vẫn là schema cũ (còn `tags`, chưa có `role`) vì schema mới chưa từng được áp → sao lưu `pg_dump` rồi dựng lại bằng migration + seed.
  - Lỗi múi giờ do dùng `toISOString()` (UTC) để hiển thị → thêm `frontend/lib/datetime.ts`, cấm dùng cách cũ.
  - Test unit (CSDL giả) không bắt được lỗi giao diện/ràng buộc CSDL → thêm test API chạy trên CSDL thật `study_work_test`.
- **Tiếp theo:** Thông báo + Admin (giao Gemini, `plan/06`); tự kiểm thử thủ công trên trình duyệt trước khi tick các mục "Kiểm thử" của GĐ1–GĐ2.

---

### 25/10/2026 — GĐ4 Trụ Kế hoạch
- **Đã làm:** `backend/src/planning/` (graph.ts phát hiện vòng, scoring.ts chấm điểm, `GET /planning/overview`); luật quan hệ: DEPENDS_ON/PARENT_OF chỉ giữa Task, cấm vòng, một việc chỉ một việc cha; thêm `estimatedMinutes` (migration + CHECK chỉ Task). Giao diện: thẻ "Hôm nay làm gì?" ở Dashboard (kèm lý do, mức quá tải, danh sách việc bị chặn), 🔒 trên Kanban, khối "Kế hoạch" trong Drawer (chặn bởi, mở khoá, việc cha/con + tiến độ), hỏi xác nhận khi đánh dấu xong việc còn bị chặn, hiện lỗi cụ thể khi nối vòng.
- **Kiểm chứng:** 14 unit test thuật toán + 7 test API; chạy thật trên trình duyệt, thẻ gợi ý hiện đúng lý do trên dữ liệu seed.
- **Chưa làm:** thông báo "được mở khoá", việc lặp lại, cảnh báo dây chuyền khi dời hạn.

---

### 25/10/2026 — GĐ5 Trụ Học tập
- **Đã làm:** Backend `src/study/`: `sm2.ts` (SM-2 theo bản gốc: cập nhật hệ số dễ rồi mới tính khoảng cách; Quên → hiện lại sau 10 phút), `cards.ts` (tách thẻ `Câu hỏi :: Trả lời`, tính chuỗi ngày), `study.service.ts` (đồng bộ thẻ giữ nguyên tiến độ, danh sách đến hạn có ưu tiên ngữ cảnh, ôn thẻ, phiên học, thống kê), `common/timezone.ts` (giờ VN dùng chung). Bảng mới `flashcards`, `flashcard_reviews`, `study_sessions` + CHECK. Giao diện: trang `/study` (ôn thẻ bằng phím Space/1–4, Pomodoro, thống kê 7 ngày), khối "Thẻ ôn tập" trong Drawer của Note, thẻ nhắc ôn trên Dashboard, mục "Học tập" ở Sidebar/MobileNav.
- **Vấn đề & cách xử lý:** bản SM-2 đầu tiên dùng hệ số dễ *cũ* để tính khoảng cách, lệch với bài gốc (SuperMemo-2) → test chuỗi Dễ-Dễ-Dễ phát hiện (16 vs 17 ngày) và sửa theo bản gốc.
- **Kiểm chứng:** 16 unit test (SM-2, tách thẻ, chuỗi ngày, múi giờ) + 10 test API (kể cả cách ly dữ liệu, thẻ của Note trong Thùng rác không hiện, ôn theo ngữ cảnh). Chạy thật trên trình duyệt: ôn thẻ bằng bàn phím, hiện lý do ngữ cảnh. **Chưa tự kiểm** khối "Thẻ ôn tập" trong Drawer và Pomodoro trên giao diện.

---

### 25/10/2026 — GĐ6 Trụ Tri thức
- **Đã làm:** Backend `src/knowledge/` (`mentions.ts` tách `[[Tiêu đề]]`, `syncMentions` tự tạo/xoá liên kết RELATES_TO có cờ `auto`, `GET /knowledge/graph`); cột mới `object_relations.auto`. Giao diện: ô gõ có gợi ý khi gõ `[[` (↑↓ Enter Esc), chip liên kết trong nội dung, nhãn Backlink trong Drawer, nút "Xem trên bản đồ", trang `/graph` (bố cục Fruchterman–Reingold tự viết, phóng/dịch/kéo nút, lọc Space + loại, tìm, ẩn mục chưa liên kết, chế độ xem quanh một mục 1–3 bước).
- **Vấn đề & cách xử lý:** bố cục lần đầu tràn ra ngoài khung nhìn (ít nút nên lực đẩy quá lớn) → thêm bước tự căn vừa khung và nút "Căn lại". Liên kết tự sinh không được xoá liên kết tạo tay → cờ `auto` + `skipDuplicates`.
- **Kiểm chứng:** 5 unit test + 9 test API (kể cả cách ly dữ liệu, mục Thùng rác/Lưu trữ không lên bản đồ). Chạy thật: bản đồ hiện đúng 8 mục, bấm chấm mở khung chi tiết, gõ `[[` hiện gợi ý và chèn đúng. **Chưa tự kiểm:** kéo thả nút, phóng to bằng cuộn, màn hình điện thoại.

---

### 25/10/2026 — GĐ3 (phần 1) Thông báo
- **Đã làm:** `backend/src/notifications/`: bảng `notification_settings` (+CHECK), quét mỗi 5 phút (sắp hạn / quá hạn / sự kiện / thẻ cần ôn), bản tin buổi sáng 07:00 giờ VN, chống trùng bằng `@@unique([userId, dedupeKey])`, giờ yên lặng (vắt qua nửa đêm), thông báo "được mở khoá" chỉ khi mọi tiền đề xong, dọn nhắc hạn khi Task xong/huỷ/Thùng rác/Lưu trữ, `broadcast()` cho Admin. Giao diện: chuông có số chưa đọc (poll 60s), danh sách thả xuống, trang `/notifications`, thẻ cài đặt trong `/profile`.
- **Vấn đề & cách xử lý:** 2 test giờ yên lặng ban đầu viết kỳ vọng sai (23:30 UTC = 06:30 VN; 00:00 UTC = đúng 07:00 VN) → sửa test, code đúng. Header đã mất chuông từ lúc làm lại giao diện → thêm `NotificationBell`.
- **Kiểm chứng:** 9 unit test luật + 15 test API (không trùng khi quét lại, đổi hạn thì báo lại, tắt loại, khoá, giờ yên lặng, cách ly dữ liệu, broadcast). Chạy thật: chuông hiện "1 chưa đọc", danh sách thả xuống đúng.
- **Chưa làm:** kênh ngoài app (trình duyệt/email/.ics/Telegram — GĐ7). **Chưa tự kiểm:** trang `/notifications`, thẻ cài đặt, đánh dấu đã đọc/xoá trên giao diện.
