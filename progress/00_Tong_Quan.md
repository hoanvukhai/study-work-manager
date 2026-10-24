# Bảng điều khiển tiến độ dự án

> Thư mục này phục vụ tra cứu nhanh các thay đổi mã nguồn qua từng phiên làm việc.
> Cập nhật lần cuối: 12/10/2026

---

## 1. Trạng thái tổng thể các giai đoạn

| GĐ | Tên giai đoạn | Trạng thái | File chi tiết |
|:---:|---|:---:|---|
| **GĐ0** | Chốt và dọn nền (Schema, Migration, Sửa lỗi nghiêm trọng, Swagger, Test) | 🟢 **Hoàn thành Phiên 01 (10/10 Test Xanh)** | [GD0_Don_Nen.md](GD0_Don_Nen.md) |
| **GĐ1** | Bộ giao diện nền (Design Tokens, Components, CSS Modules, TanStack Query) | 🟢 **Hoàn thành Phiên 02 (Build Xanh 100%)** | [GD1_Giao_Dien_Nen.md](GD1_Giao_Dien_Nen.md) |
| **GĐ2** | Hoàn thiện lõi còn thiếu (Drawer chi tiết, 4 loại Object, Gán nhiều Space, Thùng rác, Hộp nhận) | 🟢 **Hoàn thành Phiên 03 (Build Xanh 100%, 12/12 Test Xanh)** | [GD2_Loi_Chuc_Nang.md](GD2_Loi_Chuc_Nang.md) |
| **GĐ3** | Thông báo & Quản trị Admin | ⏳ Sẵn sàng thực hiện | [GD3_Thong_Bao_Admin.md](GD3_Thong_Bao_Admin.md) |
| **GĐ4** | Trụ Kế hoạch (Phụ thuộc, Việc con, Việc lặp lại, Hôm nay làm gì) | ⏳ Chờ | [GD4_Tru_Ke_Hoach.md](GD4_Tru_Ke_Hoach.md) |
| **GĐ5** | Trụ Học tập (Ôn tập SM-2, Thẻ hỏi-đáp, Pomodoro, Thống kê) | ⏳ Chờ | [GD5_Tru_Hoc_Tap.md](GD5_Tru_Hoc_Tap.md) |
| **GĐ6** | Trụ Tri thức (Liên kết nhanh `[[ ]]`, Backlink, Bản đồ tri thức) | ⏳ Chờ | [GD6_Tru_Tri_Thuc.md](GD6_Tru_Tri_Thuc.md) |
| **GĐ7** | Mở rộng (iCal, PWA, Email, AI) | ⏳ Chờ | [GD7_Mo_Rong.md](GD7_Mo_Rong.md) |
| **GĐ8** | Hoàn thiện & Bảo vệ tốt nghiệp (Test tổng, Triển khai, Đồng bộ tài liệu, Slide) | ⏳ Chờ | [GD8_Bao_Ve.md](GD8_Bao_Ve.md) |

---

## 2. Nhật ký phiên làm việc mới nhất

- **Phiên 03 (12/10/2026):** Hoàn thành **GĐ2 — Hoàn thiện lõi còn thiếu**.
- **Kết quả đạt được:**
  1. Xây dựng **ObjectDetailDrawer (UI-07)** trượt mượt mà từ bên phải màn hình: xem/sửa trực tiếp, gán/gỡ nhiều Space dạng chip (**tính năng cốt lõi**), chuyển đổi loại đối tượng linh hoạt (**QD-06**), quản lý liên kết 2 chiều có ô tìm kiếm (**BUG-11, BUG-15**), quản lý vòng đời (Lưu trữ, Thùng rác có Hoàn tác, Khôi phục, Xoá vĩnh viễn).
  2. Tạo thanh tìm kiếm toàn cục **Command Palette (`Ctrl+K` - UI-04)** tìm kiếm tức thì cả Space và Object theo thời gian thực kèm điều hướng bàn phím.
  3. Xây dựng trang **Hộp nhận (`/inbox` - QD-04)** với thanh nhập nhanh (Quick Add) cho các đối tượng chưa gắn vào Space nào.
  4. Xây dựng trang **Thùng rác (`/trash` - BUG-03)** có tính năng Dọn sạch Thùng rác, Khôi phục (giữ nguyên các Space cũ) và Xoá vĩnh viễn với ConfirmDialog.
  5. Xây dựng trang **Kho Lưu trữ (`/archive` - BUG-08)** tách 2 tab: Đối tượng đã lưu trữ và Không gian đã lưu trữ, hỗ trợ khôi phục tức thì.
  6. Xây dựng trang **Hồ sơ & Bảo mật (`/profile` - FR-AUTH-06, FR-AUTH-07)**: cập nhật họ tên, ảnh đại diện, đổi mật khẩu (tối thiểu 8 ký tự).
  7. Tối ưu **Dashboard (TECH-05, UI-06, BUG-14)**: truy vấn đếm CSDL trực tiếp, thanh nhập nhanh, khối "Tiếp tục dở dang" có hiệu ứng pulse dot, liên kết mở Drawer chi tiết.
  8. Nâng cấp **Kanban (BUG-10)**: nút bật/tắt cột công việc Đã hủy (`CANCELLED`).
  9. Nâng cấp **Lịch trình (BUG-04, BUG-05)**: bộ chuyển đổi chế độ xem Tuần / Tháng, hiển thị cả Task và Event có khoảng thời gian trải dài.
  10. Tích hợp Drawer vào tất cả các màn hình: Dashboard, Space Detail, Kanban, Calendar, Inbox.
  11. Toàn bộ **12/12 Unit Tests backend PASS (100% xanh)**, biên dịch **NestJS và Next.js (13/13 static routes) thành công 100% không lỗi**.
