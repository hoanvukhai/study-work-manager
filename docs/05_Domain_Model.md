# 05_Domain_Model.md — Mô hình nghiệp vụ

> **Tầng:** Design (Tầng 2 / 3)  
> **Phụ thuộc vào:** [03_Functional_Analysis.md](03_Functional_Analysis.md) — Feature Matrix, Use Cases  
> **Tài liệu tiếp theo:** [06_Database_Design.md](06_Database_Design.md)  
> **Trạng thái:** ⬜ Chưa bắt đầu  
> **Cập nhật lần cuối:** —

---

<!--
  HƯỚNG DẪN VIẾT FILE NÀY:
  
  Domain Model = mô hình thực thể nghiệp vụ, THUẦN NGHIỆP VỤ.
  KHÔNG nghĩ đến database, bảng, cột, khóa ngoại ở đây.
  Câu hỏi cần trả lời: "Hệ thống quản lý những khái niệm gì? Chúng liên hệ nhau thế nào?"
  
  Sau khi xong mục này mới sang 06_Database_Design.md để chuyển sang schema.
-->

## 1. Domain Glossary (Từ điển nghiệp vụ)

> **Mục này cực kỳ quan trọng** — định nghĩa rõ mỗi khái niệm để mọi tài liệu sau dùng chung một định nghĩa.  
> Khi hội đồng hỏi "Task khác Learning ở chỗ nào?", trả lời tại đây.

| Entity | Định nghĩa | Ví dụ |
|---|---|---|
| **User** | Người dùng đã đăng ký và đăng nhập vào hệ thống | — |
| **Task** | Một công việc cần hoàn thành, có thể có deadline. Đại diện cho "việc phải làm" theo hướng output/delivery. | "Nộp báo cáo chương 3", "Fix bug login page" |
| **Learning** | Một nội dung/hoạt động học tập, có thể có deadline. Đại diện cho "việc cần học" theo hướng input/knowledge. | "Học Chương 5 giáo trình CSDL", "Xem 3 bài video React Hooks" |
| **Calendar Event** | Một sự kiện có thời gian cụ thể (ngày giờ bắt đầu/kết thúc). Có thể liên kết với Task hoặc Learning, hoặc đứng độc lập. | "Họp nhóm lúc 9h thứ Hai", "Deadline Task ABC" |
| **Reference** | Một tài liệu/link tham khảo, được gắn vào Task hoặc Learning cụ thể. | Link bài báo, file PDF, URL tài liệu |
| **Tag** | Nhãn ngắn gọn để phân loại Task/Learning/Reference. | "CNTT", "Tiếng Nhật", "Đồ án" |
| **Notification** | Thông báo được tạo tự động khi đến hoặc sắp đến deadline của Task/Learning. | "Task 'Nộp báo cáo' còn 1 ngày" |

---

## 2. Domain Entities & Quan hệ

### Danh sách entities

| Entity | Mô tả ngắn | Thuộc tính chính |
|---|---|---|
| User | Người dùng | email, password, name |
| Task | Công việc | title, description, status, priority, dueDate |
| Learning | Nội dung học | title, description, status, progress, dueDate |
| CalendarEvent | Sự kiện lịch | title, startTime, endTime, linkedTo |
| Reference | Tài liệu tham khảo | title, url, note |
| Tag | Nhãn | name, color |
| Notification | Thông báo | message, isRead, triggeredBy |

### Quan hệ giữa entities (nghiệp vụ)

```
User ──< Task           (1 user có nhiều task)
User ──< Learning       (1 user có nhiều learning item)
User ──< CalendarEvent  (1 user có nhiều sự kiện)

Task >──< Tag           (task có nhiều tag, tag dùng cho nhiều task)
Learning >──< Tag       (tương tự)

Task ──< Reference      (1 task có nhiều tài liệu tham khảo)
Learning ──< Reference  (1 learning item có nhiều tài liệu tham khảo)

Task ──< CalendarEvent  (deadline của task tạo ra calendar event)
Learning ──< CalendarEvent (deadline của learning tạo ra calendar event)

Task ──< Notification   (khi đến deadline task, tạo notification)
Learning ──< Notification (tương tự)
```

### Sơ đồ Domain Model

*(Vẽ bằng draw.io, lưu tại `../diagrams/05_Domain.drawio`)*

<!-- ![Domain Model](../diagrams/exports/domain-model.png) -->

---

## 3. Trạng thái (Status) của Task và Learning

### Task Status

```
TODO → IN_PROGRESS → DONE
              ↓
           CANCELLED
```

| Status | Ý nghĩa |
|---|---|
| `TODO` | Chưa bắt đầu |
| `IN_PROGRESS` | Đang thực hiện |
| `DONE` | Đã hoàn thành |
| `CANCELLED` | Đã hủy |

### Learning Status

```
NOT_STARTED → IN_PROGRESS → COMPLETED
```

| Status | Ý nghĩa |
|---|---|
| `NOT_STARTED` | Chưa bắt đầu |
| `IN_PROGRESS` | Đang học |
| `COMPLETED` | Đã học xong |

---

*Tài liệu tiếp theo trong chuỗi: [06_Database_Design.md](06_Database_Design.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
