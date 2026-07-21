# Design — Thiết kế giao diện (Figma)

File `.fig` của Figma **không được commit** lên Git (quá lớn, không diff được).  
Thay vào đó, lưu **link Figma view-only** tại đây.

---

## Links Figma

> *(Thêm link vào đây sau khi tạo file Figma)*

| Nội dung | Link |
|---|---|
| Wireframes (tất cả màn hình) | *(chưa có)* |
| Design System (màu, font, component) | *(chưa có)* |
| Prototype (luồng tương tác) | *(chưa có)* |

---

## Hướng dẫn tổ chức Figma

### Cấu trúc Pages trong Figma

```
Page 1: Cover         — Tên project, thông tin
Page 2: Design System — Colors, Typography, Components
Page 3: Wireframes    — Tất cả màn hình dạng wireframe (low-fi)
Page 4: UI Design     — Thiết kế hoàn chỉnh (high-fi)
Page 5: Prototype     — Prototype có thể click
```

### Cấu trúc Frames (màn hình)

Mỗi màn hình đặt trong một Frame, đặt tên theo route:
```
auth/login
auth/register
main/dashboard
main/tasks
main/tasks/[id]
main/learning
main/calendar
main/references
```

---

## Export ảnh cho báo cáo

Khi cần ảnh màn hình cho báo cáo:
1. Trong Figma: chọn Frame → Right Click → Copy as PNG
2. Lưu vào `../report/images/ch3/` hoặc `../report/images/ch4/`
3. Tham chiếu trong tài liệu: `../docs/08_UI_UX_Design.md`

---

*Chi tiết thiết kế: [docs/08_UI_UX_Design.md](../docs/08_UI_UX_Design.md)*
