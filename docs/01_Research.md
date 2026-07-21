# 01_Research.md — Nghiên cứu & Xác định bài toán

> **Tầng:** Business (Tầng 1 / 3)  
> **Phụ thuộc vào:** *(Tài liệu khởi đầu — không phụ thuộc tài liệu nào)*  
> **Tài liệu tiếp theo:** [02_Requirement.md](02_Requirement.md) — chuyển Pain Points thành Functional Requirements  
> **Trạng thái:** ✅ Hoàn thành  
> **Cập nhật lần cuối:** 2026-07-21

---

## 1. Background (Bối cảnh)

Trong quá trình học tập và làm việc, một người — đặc biệt là sinh viên, freelancer hoặc lập trình viên cá nhân — thường phải theo dõi rất nhiều đầu việc cùng lúc: bài tập trên lớp, đồ án tốt nghiệp, dự án cá nhân, deadline với khách hàng, lịch học thêm... Mỗi loại công việc lại được quản lý bằng một công cụ khác nhau, chưa có công cụ nào cho phép nhìn tổng thể công việc, học tập và lịch trình trong cùng một chỗ.

## 2. Existing Solutions (Giải pháp hiện có)

| Công cụ | Giải quyết tốt | Hạn chế khi dùng cho học tập & công việc cá nhân |
|---|---|---|
| Google Calendar | Xem lịch, đặt lịch nhắc | Không gắn được với nội dung công việc/tài liệu cụ thể |
| Google Drive | Lưu trữ tài liệu | Không liên kết tài liệu với deadline hay công việc |
| GitHub | Quản lý mã nguồn, issue | Không phù hợp để quản lý việc học/lịch trình cá nhân |
| Notion / Trello | Quản lý task linh hoạt | Cần tự cấu hình nhiều, không có sẵn khái niệm "học tập" tách riêng với "công việc" |

→ Chưa có công cụ nào gộp chung **Task – Learning – Calendar – Reference** vào một hệ thống thống nhất, đúng theo nhu cầu của người dùng cá nhân.

## 3. Target Users (Đối tượng người dùng)

Nhóm người dùng mục tiêu của đề tài là **Young Knowledge Worker** — người trẻ có công việc chính xoay quanh xử lý thông tin/tri thức, gồm:

- Sinh viên (đang làm đồ án, bài tập, học thêm kỹ năng/ngoại ngữ)
- Freelancer (thiết kế, lập trình, viết lách...)
- Người tự học (học khoá học online)
- Lập trình viên cá nhân / làm dự án riêng

## 4. User Personas

### Persona 1 — Sinh viên năm cuối

- **Tên:** Nam, 21 tuổi
- **Ngành học:** Công nghệ thông tin
- **Bối cảnh:** Đang làm đồ án tốt nghiệp, học thêm tiếng Nhật buổi tối, có tài khoản GitHub cho code đồ án, dùng Google Drive lưu tài liệu tham khảo, dùng Google Calendar ghi lịch học.
- **Khó khăn:** Thường quên deadline nộp báo cáo; khi cần tìm lại tài liệu liên quan đến một phần đồ án phải mở cả GitHub lẫn Drive; lịch học tiếng Nhật và lịch làm đồ án không nằm cùng một chỗ nên dễ bị chồng lịch.

### Persona 2 — Freelancer

- **Tên:** Linh, 24 tuổi
- **Công việc:** Nhận dự án thiết kế/lập trình cho nhiều khách hàng cùng lúc
- **Bối cảnh:** Mỗi khách hàng có deadline và tài liệu trao đổi riêng, thường nằm rải rác trên email, Zalo, Drive.
- **Khó khăn:** Khó nhớ dự án nào cần giao trước; tài liệu/feedback của khách bị thất lạc giữa nhiều kênh liên lạc khác nhau.

### Persona 3 — Người tự học

- **Tên:** Huy, 26 tuổi
- **Công việc:** Nhân viên văn phòng, tự học thêm lập trình qua khoá học online buổi tối
- **Bối cảnh:** Theo dõi tiến độ nhiều khoá học cùng lúc, ghi chú bài học rải rác trong nhiều app note khác nhau.
- **Khó khăn:** Không theo dõi được mình đã học tới đâu; ghi chú và tài liệu tham khảo của từng bài học không gắn với lịch học cụ thể.

## 5. Pain Points

| # | Pain Point | Persona bị ảnh hưởng |
|---|---|---|
| PP-01 | Không nhớ hôm nay có deadline nào cần hoàn thành | Cả 3 |
| PP-02 | Quên công việc/bài tập đã được giao trước đó | Nam (P1), Linh (P2) |
| PP-03 | Không nhớ tài liệu hoặc mã nguồn liên quan đến một công việc cụ thể đang nằm ở đâu | Cả 3 |
| PP-04 | Lịch học/lịch làm việc không liên kết với công việc hay nội dung học tập cụ thể | Nam (P1), Huy (P3) |
| PP-05 | Phải mở nhiều ứng dụng khác nhau chỉ để tổng hợp thông tin về một công việc | Cả 3 |

## 6. Problem Statement

Hiện nay, một người thường phải sử dụng nhiều ứng dụng khác nhau để phục vụ việc học tập và công việc, như Google Calendar để theo dõi lịch trình, Google Drive để lưu trữ tài liệu, GitHub để quản lý mã nguồn, hay các ứng dụng quản lý công việc như Trello, Notion. Mỗi ứng dụng chỉ giải quyết một nhu cầu riêng lẻ nên thông tin liên quan đến một công việc thường bị phân tán ở nhiều nơi khác nhau.

Khi cần theo dõi tiến độ của một công việc cụ thể, người dùng phải mở nhiều ứng dụng để tìm lịch trình, tài liệu hoặc ghi chú liên quan, gây mất thời gian và khó kiểm soát toàn bộ công việc đang thực hiện.

Từ thực tế đó, đề tài hướng đến việc xây dựng một ứng dụng quản lý học tập và công việc cá nhân, giúp người dùng tập trung các thông tin cần thiết trên cùng một nền tảng, hỗ trợ quản lý công việc, lịch trình, nội dung học tập và tài liệu tham khảo một cách thuận tiện, nhất quán hơn.

## 7. Objectives (Mục tiêu)

| # | Mục tiêu | Giải quyết Pain Point |
|---|---|---|
| OBJ-01 | Cho phép người dùng tạo, cập nhật, theo dõi trạng thái Task | PP-02 |
| OBJ-02 | Cho phép quản lý nội dung học tập (Learning), có deadline riêng | PP-01, PP-04 |
| OBJ-03 | Đồng bộ lịch trình (Calendar) với Task và Learning | PP-04, PP-05 |
| OBJ-04 | Lưu trữ tài liệu tham khảo (Reference), gắn trực tiếp với Task/Learning | PP-03 |
| OBJ-05 | Cung cấp Dashboard tổng quan toàn bộ trong cùng một màn hình | PP-05 |
| OBJ-06 | Nhắc nhở deadline qua Notification | PP-01 |

## 8. Scope (Phạm vi)

**Trong phạm vi:**
- Ứng dụng web, phục vụ 1 người dùng cá nhân (không phải hệ thống nhiều người dùng/tổ chức).
- Module: Auth, Dashboard, Task, Learning, Calendar, Reference, Notification.

**Ngoài phạm vi:**
- Cộng tác thời gian thực nhiều người dùng (no real-time collaboration).
- Ứng dụng di động dạng native (chỉ responsive web).
- Tích hợp thanh toán, phân quyền tổ chức phức tạp (no multi-tenant).
- AI/ML, Blockchain, Microservices.

---

*Tài liệu tiếp theo trong chuỗi: [02_Requirement.md](02_Requirement.md) — chuyển Pain Points & Objectives thành Functional Requirements cụ thể*  
*Quay lại mục lục: [docs/README.md](README.md)*
