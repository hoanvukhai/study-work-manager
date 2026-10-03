# Design — Thiết kế giao diện (Figma & Wireframe)

Thư mục này quản lý toàn bộ thiết kế giao diện UI/UX của đồ án, bao gồm liên kết dự án trên Figma, các bản phác thảo HTML/CSS tham chiếu và ảnh chụp màn hình wireframe thực tế.

---

## Liên kết Figma chính thức

| Nội dung | Liên kết |
| --- | --- |
| Figma StudyWork (Tổng hợp Wireframes, Design System & Screens) | [Figma StudyWork](https://www.figma.com/design/tkGn1vGAX1TZdhFxrCbuDa/StudyWork?node-id=0-1&t=9jEdzPWdy33IReqi-1) |

---

## Cấu trúc các màn hình chính (Screens)

Các màn hình được thiết kế đồng nhất theo Kiến trúc Lần 3 (Mô hình Không gian linh hoạt & Hạt nhân Đa hình Object):

1. `auth/login`: Màn hình Đăng nhập tài khoản.
2. `auth/register`: Màn hình Đăng ký tài khoản mới.
3. `dashboard`: Màn hình Tổng quan cá nhân tập trung (việc khẩn cấp, lịch trình sắp tới, ghi chú gần đây).
4. `spaces`: Danh sách và quản lý các Không gian làm việc.
5. `spaces/[id]`: Màn hình chi tiết Không gian với 4 chế độ hiển thị:
   - Dòng nội dung tổng hợp (`📑 Tất cả`)
   - Bảng công việc kéo thả (`Kanban`)
   - Bảng vẽ tư duy kết nối tri thức (`Canvas`)
   - Lịch công việc & sự kiện (`Lịch`)
6. `inbox`: Hộp thư nhanh thu nhận mọi ý tưởng chưa phân loại.
7. `trash`: Thùng rác lưu trữ và khôi phục đối tượng đã xóa mềm.
8. `zen`: Chế độ tập trung sâu (Zen Focus Mode) loại bỏ toàn bộ thanh điều hướng, kèm đồng hồ đếm ngược.
9. `detail-modal`: Cửa sổ xem/sửa chi tiết đối tượng và liên kết tri thức 2 chiều.
10. `mobile`: Giao diện di động chuẩn kích thước 390x844 px.

---

## Thư mục xuất ảnh giao diện (`exports/`)

Toàn bộ ảnh wireframe thực tế phục vụ tài liệu và báo cáo tốt nghiệp được lưu trữ tập trung tại **`design/exports/`**:

```text
design/exports/
├── wireframe-dashboard.png
├── wireframe-space.png
├── wireframe-kanban.png
├── wireframe-calendar.png
├── wireframe-canvas.png
├── wireframe-detail-modal.png
├── wireframe-mobile.png
├── wireframe-inbox.png
├── wireframe-trash.png
├── wireframe-login.png
├── wireframe-zen.png
├── wireframe-search.png
└── wireframe-create.png
```

> *Lưu ý:* Thư mục `diagrams/exports/` chỉ dành riêng cho các sơ đồ kỹ thuật (Use Case, Activity, Architecture, ERD). Toàn bộ ảnh chụp giao diện người dùng phải đặt tại `design/exports/`.

---

*Chi tiết tài liệu thiết kế: [docs/08_UI_UX_Design.md](../docs/08_UI_UX_Design.md)*
