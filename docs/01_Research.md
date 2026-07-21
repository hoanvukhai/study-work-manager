# 01 — Khảo sát & Xác định bài toán

> Phụ thuộc vào: *(tài liệu đầu tiên, không phụ thuộc file nào)*  
> Làm căn cứ cho: [02_Requirement.md](02_Requirement.md)  
> Trạng thái: 🔄 Đang viết

---

## 1. Bối cảnh

<!-- BẠN VIẾT: Viết bằng lời của bạn — bạn đang gặp vấn đề gì trong việc quản lý học tập và công việc? Đừng copy từ đâu, viết như đang kể chuyện cho người bạn nghe. Vài câu là đủ. -->



---

## 2. Các công cụ hiện có

Bên dưới là bảng tóm tắt những công cụ phổ biến và lý do chúng chưa đáp ứng đủ nhu cầu:

| Công cụ | Làm tốt | Hạn chế |
|---|---|---|
| Google Calendar | Đặt lịch, nhắc nhở | Không gắn được với nội dung công việc cụ thể |
| Google Drive | Lưu trữ file | Không liên kết file với deadline hay task |
| Notion / Trello | Quản lý task linh hoạt | Phải tự cấu hình nhiều, không có khái niệm "học tập" riêng biệt |
| GitHub | Quản lý code, issue | Không phù hợp để ghi lịch học hay lưu tài liệu cá nhân |

<!-- BẠN VIẾT: Sau bảng này, thêm 1-2 câu nhận xét của bạn — điểm chung của các công cụ trên là gì? Tại sao chúng vẫn chưa đủ? -->



---

## 3. Người dùng mục tiêu

<!-- BẠN VIẾT: Ai sẽ dùng ứng dụng này? Mô tả ngắn gọn — không cần liệt kê đủ loại, chỉ cần rõ nhóm chính là ai. -->



---

## 4. Personas

Dưới đây là 3 người dùng giả định đại diện cho nhóm mục tiêu:

### Persona 1

<!-- BẠN VIẾT: Một sinh viên như bạn hoặc người bạn biết. Tên tuổi ngành, đang làm gì, gặp vấn đề gì cụ thể khi quản lý học tập. Viết như đang kể về người thật. -->

**Tên:** ...  
**Bối cảnh:** ...  
**Vấn đề gặp phải:** ...

---

### Persona 2

<!-- BẠN VIẾT: Freelancer hoặc người đi làm tự học thêm. -->

**Tên:** ...  
**Bối cảnh:** ...  
**Vấn đề gặp phải:** ...

---

### Persona 3

<!-- BẠN VIẾT: Người tự học online, không nhất thiết phải là sinh viên. -->

**Tên:** ...  
**Bối cảnh:** ...  
**Vấn đề gặp phải:** ...

---

## 5. Vấn đề cụ thể (Pain Points)

<!-- BẠN VIẾT: Dựa trên 3 personas ở trên, tổng hợp lại những vấn đề chung họ đều gặp. Khoảng 4-6 điểm là đủ. Đặt ID để tiện tham chiếu sau. -->

| ID | Vấn đề |
|---|---|
| PP-01 | ... |
| PP-02 | ... |
| PP-03 | ... |
| PP-04 | ... |
| PP-05 | ... |

---

## 6. Phát biểu bài toán

<!-- BẠN VIẾT: Tóm gọn bài toán trong 1 đoạn — từ vấn đề nêu trên, đề tài này muốn giải quyết cái gì cụ thể? Viết như đang trình bày với hội đồng. -->



---

## 7. Mục tiêu

Dựa trên các vấn đề đã nêu, ứng dụng cần đạt được:

| ID | Mục tiêu | Giải quyết vấn đề |
|---|---|---|
| OBJ-01 | Cho phép tạo và theo dõi Task có deadline | PP-01, PP-02 |
| OBJ-02 | Quản lý nội dung học tập (Learning) riêng biệt với Task | PP-01 |
| OBJ-03 | Lịch trình liên kết với Task và Learning | PP-04 |
| OBJ-04 | Lưu tài liệu tham khảo gắn với Task/Learning cụ thể | PP-03 |
| OBJ-05 | Dashboard tổng quan trong một màn hình | PP-05 |
| OBJ-06 | Thông báo nhắc deadline | PP-01 |

<!-- BẠN VIẾT: Điều chỉnh bảng trên cho khớp với vấn đề bạn đã liệt kê ở mục 5. ID PP-xx phải khớp. -->

---

## 8. Phạm vi

**Sẽ làm:**
- Ứng dụng web, dùng cho 1 người (không phải team)
- Các module: Auth, Dashboard, Task, Learning, Calendar, Reference, Notification

**Không làm:**
- Cộng tác nhiều người trên cùng một task
- App mobile native
- Tích hợp thanh toán hay phân quyền theo tổ chức

---

*Tiếp theo: [02_Requirement.md](02_Requirement.md) — chuyển các vấn đề và mục tiêu ở trên thành danh sách yêu cầu cụ thể*
