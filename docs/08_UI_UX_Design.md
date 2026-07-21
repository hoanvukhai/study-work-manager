# 08_UI_UX_Design.md — Thiết kế giao diện

> **Tầng:** Design (Tầng 2 / 3)  
> **Phụ thuộc vào:** [07_API_Design.md](07_API_Design.md) — Danh sách endpoint & dữ liệu trả về  
> **Tài liệu tiếp theo:** [09_Implementation.md](09_Implementation.md)  
> **Trạng thái:** ⬜ Chưa bắt đầu  
> **Cập nhật lần cuối:** —

---

<!--
  HƯỚNG DẪN VIẾT FILE NÀY:
  
  Quy trình chuẩn:
  1. Vẽ Sitemap (cấu trúc trang) — có thể vẽ bằng draw.io hoặc mô tả text
  2. Vẽ User Flow (luồng người dùng qua các trang)
  3. Wireframe → thiết kế trên Figma
  4. Design System (màu sắc, font, component)
  5. Prototype (link Figma share)
  
  LƯU Ý: Không commit file .fig lên Git.
  Chỉ lưu LINK Figma (view-only) trong file này.
  Export ảnh màn hình ra ../diagrams/exports/ hoặc ../report/images/
-->

## 1. Sitemap

```
/ (root)
├── /login            — Đăng nhập
├── /register         — Đăng ký
└── /dashboard        — Dashboard tổng quan (trang chính sau login)
    ├── /tasks         — Danh sách task
    │   └── /tasks/:id — Chi tiết task
    ├── /learning      — Danh sách learning
    │   └── /learning/:id — Chi tiết learning
    ├── /calendar      — Lịch trình
    ├── /references    — Tài liệu tham khảo
    └── /settings      — Cài đặt tài khoản (optional)
```

---

## 2. User Flow chính

*(Vẽ bằng draw.io nếu cần, hoặc mô tả text)*

**Flow: Tạo Task mới**
```
Dashboard → Nhấn "Tạo Task" → Modal/Form → Điền thông tin → Submit
    → Thành công → Trở lại danh sách, task mới xuất hiện đầu
    → Lỗi → Hiển thị lỗi inline, giữ nguyên form
```

**Flow: Xem tổng quan ngày hôm nay**
```
Dashboard → Xem "Today's Events" → Click event → Chi tiết Task/Learning tương ứng
```

---

## 3. Wireframe & Prototype

> **Link Figma (thêm vào đây khi có):**
>
> - Wireframes: *(link)*
> - Prototype: *(link)*
> - Design System: *(link)*

---

## 4. Design System

### Màu sắc

| Token | Màu | Hex | Dùng cho |
|---|---|---|---|
| `primary` | Indigo | `#6366f1` | Button chính, link |
| `primary-dark` | Indigo đậm | `#4f46e5` | Hover state |
| `success` | Emerald | `#10b981` | Status DONE / COMPLETED |
| `warning` | Amber | `#f59e0b` | Deadline sắp đến |
| `danger` | Red | `#ef4444` | Quá deadline, xóa |
| `neutral-50` | Trắng nhạt | `#f9fafb` | Background |
| `neutral-900` | Đen | `#111827` | Text chính |

### Typography

| Token | Font | Size | Weight | Dùng cho |
|---|---|---|---|---|
| `heading-1` | Inter | 24px | 700 | Tiêu đề trang |
| `heading-2` | Inter | 20px | 600 | Tiêu đề section |
| `body` | Inter | 14px | 400 | Nội dung |
| `caption` | Inter | 12px | 400 | Metadata, timestamp |

### Component List

| Component | Dùng ở đâu |
|---|---|
| `Button` (primary, secondary, danger) | Toàn app |
| `Input`, `Textarea`, `Select` | Form tạo/sửa |
| `Modal` | Form tạo/sửa nhanh |
| `TaskCard` | Danh sách task |
| `LearningCard` | Danh sách learning |
| `StatusBadge` | Hiển thị status |
| `PriorityBadge` | Hiển thị priority |
| `Tag` | Hiển thị tag |
| `CalendarGrid` | Trang lịch |
| `Sidebar` | Layout chính |
| `Notification Toast` | Thông báo hành động |

---

## 5. Responsive Notes

| Breakpoint | Thay đổi layout |
|---|---|
| `< 768px` (mobile) | Sidebar ẩn → bottom navigation |
| `768px – 1024px` (tablet) | Sidebar thu gọn (chỉ icon) |
| `>= 1024px` (desktop) | Sidebar đầy đủ + content area |

---

## 6. Màn hình chính (mô tả)

### Dashboard

- **Header:** Tên người dùng, ngày hôm nay, icon notification
- **Left column (2/3):** Tasks đang IN_PROGRESS + sắp đến deadline
- **Right column (1/3):** Events hôm nay, Learning đang học

### Tasks Page

- **Thanh lọc:** Status, Priority, Tag
- **List view:** TaskCard (title, status badge, priority badge, deadline, tags)
- **FAB hoặc Button "+":** Mở form tạo task mới

### Calendar Page

- **Monthly view** (default) + nút chuyển Weekly view
- **Click vào ngày:** Xem events của ngày đó
- **Click vào event:** Xem chi tiết (liên kết tới task/learning tương ứng)

---

*Tài liệu tiếp theo trong chuỗi: [09_Implementation.md](09_Implementation.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
