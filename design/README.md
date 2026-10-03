# Design — Thiết kế giao diện (Figma)

File `.fig` của Figma **không được commit** lên Git (quá lớn, không diff được).  
Thay vào đó, lưu **link Figma view-only** tại đây.

---

## Links Figma

> *(Thêm link vào đây sau khi tạo file Figma)*

| Nội dung | Link |
|---|---|
| Wireframes (tất cả màn hình) | [Figma StudyWork](https://www.figma.com/design/tkGn1vGAX1TZdhFxrCbuDa/StudyWork?node-id=0-1&t=9jEdzPWdy33IReqi-1) |
| Design System (màu, font, component) | [Figma StudyWork](https://www.figma.com/design/tkGn1vGAX1TZdhFxrCbuDa/StudyWork?node-id=0-1&t=9jEdzPWdy33IReqi-1) |
| Prototype (luồng tương tác) | [Figma StudyWork](https://www.figma.com/design/tkGn1vGAX1TZdhFxrCbuDa/StudyWork?node-id=0-1&t=9jEdzPWdy33IReqi-1) |

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
1. Trong Figma: Lưu ảnh màn hình giao diện thực tế vào `design/exports/`
2. Lưu vào `design/exports/`
3. Tham chiếu trong tài liệu: `../docs/08_UI_UX_Design.md`

---

*Chi tiết thiết kế: [docs/08_UI_UX_Design.md](../docs/08_UI_UX_Design.md)*
