# GĐ1 — Bộ giao diện nền

> Trạng thái: 🚀 **Hoàn thành xuất sắc Phiên 02 (Bộ Design Tokens, 13 Components, TanStack Query & Responsive Layout)**  
> Cập nhật lúc: 12/10/2026

---

## 1. Mục tiêu và Danh sách việc cần làm (Checklist)

- [x] **Hệ thống Design Tokens chuẩn Google Neutral & Dark Mode:**
  - [x] Thiết lập bảng màu CSS Custom Variables đồng bộ theo tài liệu `08_Kien_Truc_Giao_Dien.md` trong `globals.css` (Google Neutral Light: `#1a73e8`, `#f8f9fa`, `#ffffff`, `#dadce0`; Google Dark: `#8ab4f8`, `#202124`, `#2d2e30`, `#3c4043`).
  - [x] Xây dựng `ThemeProvider` và hook `useTheme` (`lib/theme-context.tsx`), tự động ghi nhớ tùy chọn vào `localStorage` và class `dark` trên `<html>`.
- [x] **Bộ 13 Component dùng chung (QD-16, UI-03, UI-08):**
  - [x] `Button`: Hỗ trợ biến thể (primary, secondary, danger, ghost), kích cỡ (sm, md, lg), trạng thái loading.
  - [x] `Input`: Label, thông báo lỗi, icon trái, focus ring.
  - [x] `Textarea`: Tự co giãn dọc, label, thông báo lỗi.
  - [x] `Select`: Dropdown tùy biến với chevron indicator, label, danh sách options.
  - [x] `DatePicker`: Hỗ trợ `date` và `datetime-local` với icon lịch trực quan.
  - [x] `Dialog`: Hộp thoại modal với backdrop blur, phím Esc đóng, focus trap, animation mượt mà.
  - [x] `ConfirmDialog`: Thay thế triệt để `window.confirm()` của trình duyệt (UI-03), hỗ trợ biến thể nguy hiểm, phím Esc và hủy thao tác.
  - [x] `Toast`: Thông báo nổi góc màn hình hỗ trợ **Hoàn tác (Undo)**, các kiểu `success`, `error`, `info`, tự động biến mất.
  - [x] `Badge`: Thẻ phân loại 4 loại đối tượng (`task`, `note`, `event`, `reference`) và biến thể ngữ nghĩa (`success`, `warning`, `danger`, `default`).
  - [x] `DropdownMenu`: Menu tùy chọn thả xuống, tự đóng khi click bên ngoài, căn lề trái/phải.
  - [x] `Tabs`: Thanh chuyển tab có đếm số lượng, hiệu ứng underline mượt.
  - [x] `EmptyState`: Trạng thái rỗng chuyên nghiệp với biểu tượng, tiêu đề, mô tả và nút hành động.
  - [x] `Skeleton`: Hiệu ứng tải placeholder shimmer thay thế spinner thô.
  - [x] Barrel export `components/ui/index.ts` tiện lợi cho toàn dự án.
- [x] **Tích hợp TanStack Query v5 & Custom Hooks:**
  - [x] Cài đặt `@tanstack/react-query@^5.28.4`, cấu hình `ReactQueryProvider` với staleTime 60s.
  - [x] `useSpaces`: `useSpaces`, `useSpace`, `useCreateSpace`, `useUpdateSpace`, `useDeleteSpace`.
  - [x] `useObjects`: `useObjects`, `useObject`, `useCreateObject`, `useUpdateObject`, `useUpdateObjectLifecycle`, `useDeleteObject`, `useAttachObjectToSpace`, `useRemoveObjectFromSpace`.
  - [x] `useViews`: `useKanban`, `useCalendar`, `useDashboardSummary`.
  - [x] Tự động làm mới cache (invalidateQueries) chéo giữa Spaces, Objects, Views và Dashboard.
- [x] **Kiến trúc Bố cục Responsive & Điều hướng di động:**
  - [x] `Sidebar`: Chuyển hoàn toàn sang CSS Modules, trên mobile chuyển thành ngăn kéo trượt (drawer) có backdrop mờ.
  - [x] `Header`: Nút menu hamburger trên mobile, nút chuyển theme Sáng/Tối (UI-09), thanh tìm kiếm `Ctrl+K`.
  - [x] `MobileNav`: Thanh điều hướng đáy gắn cố định trên màn hình `<= 768px` (Dashboard, Không gian, Kanban, Lịch).
  - [x] `LayoutProvider`: Quản lý trạng thái mở/đóng drawer điều hướng di động.
- [x] **Phím tắt nhanh (UI-10):**
  - [x] `Ctrl + K` (hoặc `Cmd + K`): Tự động focus ô tìm kiếm toàn cục trên Header.
  - [x] `C`: Mở nhanh hộp thoại tạo mới đối tượng (bảo vệ an toàn: không bắt khi đang focus ô nhập liệu hoặc đang mở hộp thoại).
- [x] **Xóa bỏ 100% `confirm()` và `alert()` nguyên thủy (UI-03):**
  - [x] `Sidebar`: Thay thế xác nhận xóa Space bằng `ConfirmDialog`.
  - [x] `Kanban`: Thay thế xác nhận xóa Task bằng `ConfirmDialog` và sửa **BUG-02** (gọi API chuyển Thùng rác thay vì xóa client-only).
  - [x] `Space Detail`: Thay thế xác nhận xóa Space và xóa Object bằng `ConfirmDialog`, sửa **BUG-01** (chuyển vào Thùng rác có nút Hoàn tác thay vì xóa cứng mất dữ liệu).
  - [x] `ObjectRelationsModal`: Thay thế `alert()` bằng `useToast().error()`.
- [x] **Refactor toàn diện các trang sang CSS Modules & Design System mới:**
  - [x] Trang Tổng quan Dashboard (`app/(dashboard)/page.tsx` + `Dashboard.module.css`).
  - [x] Trang Bảng Kanban (`app/(dashboard)/kanban/page.tsx` + `Kanban.module.css`).
  - [x] Trang Lịch trình tuần (`app/(dashboard)/calendar/page.tsx` + `CalendarPage.module.css`).
  - [x] Trang Chi tiết Không gian (`app/(dashboard)/spaces/[id]/page.tsx` + `SpaceDetail.module.css`).
  - [x] Trang Đăng nhập (`app/login/page.tsx` + `Auth.module.css`).
  - [x] Trang Đăng ký (`app/register/page.tsx` + `Auth.module.css`, nâng mật khẩu tối thiểu 8 ký tự theo SEC-03).

---

## 2. Chi tiết các file đã sửa & tạo mới

### A. Hệ thống Design Tokens, Theme & Cấu hình
1. `frontend/app/globals.css`:
   - Định nghĩa toàn bộ biến màu sáng/tối theo chuẩn Google Material Neutral (Doc 08).
   - Thêm biến màu tag đối tượng (`--tag-task`, `--tag-note`, `--tag-event`, `--tag-ref`).
   - Cấu hình layout shell responsive: `.app-container`, `.main-wrapper`, `.content-container`.
2. `frontend/lib/theme-context.tsx`: Context quản lý `theme: 'light' | 'dark'`, hàm `toggleTheme()`, lưu trữ `localStorage`.
3. `frontend/lib/query-provider.tsx`: Khởi tạo `QueryClientProvider` cho toàn bộ ứng dụng Next.js.
4. `frontend/lib/layout-context.tsx`: Context quản lý trạng thái đóng/mở ngăn kéo Sidebar trên thiết bị di động.
5. `frontend/app/layout.tsx`: Bọc các Provider: `ThemeProvider`, `ReactQueryProvider`, `AuthProvider`, `ToastProvider`.

### B. Bộ 13 UI Components dùng chung (`frontend/components/ui/`)
6. `Button.tsx` & `Button.module.css`: Nút bấm đa năng với các biến thể màu và trạng thái loading spinner.
7. `Input.tsx` & `Input.module.css`: Ô nhập liệu chuẩn hóa.
8. `Textarea.tsx` & `Textarea.module.css`: Khung nhập văn bản nhiều dòng.
9. `Select.tsx` & `Select.module.css`: Hộp lựa chọn với mũi tên tùy biến.
10. `DatePicker.tsx` & `DatePicker.module.css`: Bộ chọn ngày/giờ có icon trực quan.
11. `Dialog.tsx` & `Dialog.module.css`: Hộp thoại modal hỗ trợ tiêu đề, mô tả, nội dung, footer và phím Esc.
12. `ConfirmDialog.tsx` & `ConfirmDialog.module.css`: Hộp thoại xác nhận hành động nguy hiểm/cảnh báo, thay thế triệt để `confirm()`.
13. `Toast.tsx` & `Toast.module.css`: Hệ thống thông báo nổi hỗ trợ nút Hoàn tác (Undo). Cung cấp cả hook `show`, `success`, `error`, `info` và adapter `addToast`.
14. `Badge.tsx` & `Badge.module.css`: Thẻ hiển thị loại đối tượng và trạng thái ưu tiên theo bảng màu Doc 08.
15. `DropdownMenu.tsx` & `DropdownMenu.module.css`: Menu thả xuống đóng tự động khi click bên ngoài.
16. `Tabs.tsx` & `Tabs.module.css`: Thanh chuyển tab linh hoạt với đếm số lượng mục.
17. `EmptyState.tsx` & `EmptyState.module.css`: Khung hiển thị khi danh sách trống.
18. `Skeleton.tsx` & `Skeleton.module.css`: Khung tải hiệu ứng shimmer.
19. `index.ts`: Barrel export toàn bộ 13 UI components.

### C. Custom Hooks TanStack Query (`frontend/hooks/`)
20. `frontend/hooks/useSpaces.ts`: Toàn bộ các thao tác Không gian chạy qua TanStack Query.
21. `frontend/hooks/useObjects.ts`: Thao tác đối tượng (tạo, cập nhật, đổi vòng đời ARCHIVE/TRASH/RESTORE, gán/gỡ Space).
22. `frontend/hooks/useViews.ts`: Lấy dữ liệu Kanban, Calendar, Dashboard summary.

### D. Bố cục Layout & Điều hướng di động (`frontend/components/layout/`)
23. `Header.tsx` & `Header.module.css`: Thanh điều hướng đầu trang với nút đổi theme (UI-09), hamburger menu, phím tắt `Ctrl+K` và `C` (UI-10).
24. `Sidebar.tsx` & `Sidebar.module.css`: Thanh bên dùng CSS Modules, hỗ trợ context menu, ngăn kéo mobile, xóa Space qua `ConfirmDialog`.
25. `MobileNav.tsx` & `MobileNav.module.css`: Thanh điều hướng đáy cố định trên điện thoại di động (kích thước màn hình <= 768px).
26. `frontend/app/(dashboard)/layout.tsx`: Tích hợp `LayoutProvider` và `MobileNav`.

### E. Tái cấu trúc các trang chức năng
27. `frontend/app/(dashboard)/page.tsx` & `Dashboard.module.css`:
    - Chuyển sang dùng `useDashboardSummary()`, `useSpaces()`, `useUpdateObject()`.
    - Dùng `Skeleton` khi đang tải, `EmptyState` khi chưa có dữ liệu.
    - Cập nhật công việc trực tiếp có thông báo Toast.
28. `frontend/app/(dashboard)/kanban/page.tsx` & `Kanban.module.css`:
    - Dùng `useObjects()` lọc theo `spaceId`.
    - **Sửa BUG-02:** Xóa công việc kích hoạt `useUpdateObjectLifecycle` chuyển sang `TRASH` trên CSDL, hiển thị nút Hoàn tác trên Toast.
    - Dùng `ConfirmDialog` thay cho `confirm()`.
29. `frontend/app/(dashboard)/calendar/page.tsx` & `CalendarPage.module.css`:
    - Hiển thị cả Task và Event có ngày giờ.
    - Tích hợp `useObjects()`, `useSpaces()`, `useUpdateObject()`.
30. `frontend/app/(dashboard)/spaces/[id]/page.tsx` & `SpaceDetail.module.css`:
    - Tích hợp `useSpace()`, `useObjects()`, `useUpdateSpace()`, `useDeleteSpace()`.
    - **Sửa BUG-01:** Thay thế xóa cứng bằng soft delete chuyển vào Thùng rác (`TRASH`), hỗ trợ Hoàn tác ngay lập tức.
    - Dùng `ConfirmDialog` cho cả xóa Space và xóa Object.
31. `frontend/app/login/page.tsx` & `Auth.module.css`:
    - Giao diện đăng nhập chuẩn hóa theo token theme, hỗ trợ Dark Mode hoàn hảo.
32. `frontend/app/register/page.tsx` & `Auth.module.css`:
    - Đồng bộ độ dài mật khẩu tối thiểu 8 ký tự (SEC-03).
33. `frontend/components/relations/ObjectRelationsModal.tsx`:
    - Thay thế lệnh `alert()` nguyên thủy bằng `useToast().error()`.
    - Hỗ trợ linh hoạt prop `object` và `currentObject`.
34. `frontend/components/objects/CreateObjectModal.tsx`:
    - Hỗ trợ cả 4 loại đối tượng (Task, Note, Event, Reference), kiểm tra hợp lệ URL và thời gian Event.

---

## 3. Kết quả kiểm thử & Nghiệm thu

| Nội dung kiểm tra | Kết quả | Chi tiết |
|---|:---:|---|
| **Biên dịch Frontend (`next build`)** | 🟢 **PASS** | `Exit code 0` — Toàn bộ 8 route tĩnh/động biên dịch hoàn hảo, không lỗi type, không lỗi CSS. |
| **Biên dịch Backend (`nest build`)** | 🟢 **PASS** | `Exit code 0` — Mã nguồn NestJS biên dịch sạch sẽ. |
| **Kiểm thử tự động Backend (`jest`)** | 🟢 **PASS** | **10/10 tests PASS (100% xanh)** trong `objects.service.spec.ts` và `spaces.service.spec.ts`. |
| **Loại bỏ `confirm()` / `alert()`** | 🟢 **PASS** | Tìm kiếm toàn bộ codebase không còn bất kỳ lệnh `confirm()` hay `alert()` nào của trình duyệt. |
| **Giao diện đa thiết bị & Dark Mode** | 🟢 **PASS** | Hoạt động trơn tru trên 375px (Mobile Nav + Drawer), 768px (Tablet), 1280px (Desktop); Dark Mode và Light Mode chuyển đổi mượt mà. |

---

## 4. Kế hoạch tiếp theo (GĐ2)
- Tiến hành thực hiện **GĐ2 — Hoàn thiện lõi còn thiếu**:
  - Drawer chi tiết đối tượng trượt từ cạnh phải (UI-07).
  - Hoàn thiện thao tác "Một Object, nhiều Space" (gán/gỡ Space dạng chip).
  - Trang Thùng rác (`/trash`) & Trang Lưu trữ (`/archive`).
  - Trang Hộp nhận (`/inbox`) và ô nhập nhanh (QD-04).
  - Tìm kiếm toàn cục `Ctrl+K` với danh sách kết quả trực quan (UI-04).
