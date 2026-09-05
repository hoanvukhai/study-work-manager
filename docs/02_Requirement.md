# 02_Requirement.md — Yêu cầu hệ thống

> Tài liệu trước: [01_Research.md](01_Research.md)
> Tài liệu sau: [03_Functional_Analysis.md](03_Functional_Analysis.md)

---

## Liên kết với Objectives

| Objective (từ 01_Research)                                      | Nhóm FR liên quan                            |
| --------------------------------------------------------------- | -------------------------------------------- |
| OBJ-01 — Tự tạo Space theo chủ đề riêng                        | FR-SPACE                                     |
| OBJ-02 — Quản lý Task / Note / Event / Reference trong Space    | FR-TASK, FR-NOTE, FR-EVENT, FR-REF           |
| OBJ-03 — Liên kết (Relation) giữa các nội dung                 | FR-REL                                       |
| OBJ-04 — Nhiều góc nhìn (View) trên cùng dữ liệu               | FR-VIEW                                      |
| OBJ-05 — Dashboard tổng quan                                    | FR-DASH                                      |
| OBJ-06 — Nhắc nhở tự động                                      | FR-NOTIF                                     |

---

## 1. Functional Requirements (Yêu cầu chức năng)

### 1.1 Auth — Xác thực & Phiên đăng nhập

| ID          | Yêu cầu                                                                                       | Nguồn gốc        | Độ ưu tiên  |
| ----------- | --------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-AUTH-01  | Hệ thống cho phép người dùng đăng ký tài khoản bằng họ tên, email và mật khẩu.               | Base Requirement | Must have   |
| FR-AUTH-02  | Hệ thống cho phép người dùng đăng nhập bằng email và mật khẩu.                               | Base Requirement | Must have   |
| FR-AUTH-03  | Hệ thống xác thực phiên đăng nhập bằng JWT.                                                  | Base Requirement | Must have   |
| FR-AUTH-04  | Hệ thống cho phép người dùng đăng xuất khỏi hệ thống.                                        | Base Requirement | Must have   |
| FR-AUTH-05  | Hệ thống không cho phép truy cập các chức năng khi người dùng chưa đăng nhập.                | Base Requirement | Must have   |
| FR-AUTH-06  | Hệ thống cho phép người dùng xem và cập nhật thông tin cá nhân (họ tên, ảnh đại diện).       | Base Requirement | Should have |
| FR-AUTH-07  | Hệ thống cho phép người dùng thay đổi mật khẩu sau khi đăng nhập.                            | Base Requirement | Should have |
| FR-AUTH-08  | Hệ thống cho phép người dùng yêu cầu đặt lại mật khẩu khi quên (gửi link xác nhận qua email). | Base Requirement | Should have |
| FR-AUTH-09  | Hệ thống cho phép người dùng đặt lại mật khẩu thông qua liên kết được gửi về email.        | Base Requirement | Should have |
| FR-AUTH-10  | Hệ thống giới hạn số lần đăng nhập sai liên tiếp để bảo vệ tài khoản.                       | Base Requirement | Could have  |

---

### 1.2 Space — Không gian quản lý

| ID          | Yêu cầu                                                                                | Nguồn gốc        | Độ ưu tiên |
| ----------- | -------------------------------------------------------------------------------------- | ---------------- | ---------- |
| FR-SPACE-01 | Hệ thống cho phép người dùng tạo Space mới (tên và mô tả).                             | OBJ-01, PP-06    | Must have  |
| FR-SPACE-02 | Hệ thống cho phép người dùng xem danh sách Space của mình.                             | OBJ-01           | Must have  |
| FR-SPACE-03 | Hệ thống cho phép người dùng xem toàn bộ nội dung bên trong một Space.                 | OBJ-01           | Must have  |
| FR-SPACE-04 | Hệ thống cho phép người dùng cập nhật thông tin Space (đổi tên).                       | OBJ-01           | Must have  |
| FR-SPACE-05 | Hệ thống cho phép người dùng xoá Space kèm cảnh báo sẽ xoá toàn bộ nội dung bên trong. | OBJ-01           | Must have  |
| FR-SPACE-06 | Hệ thống chỉ hiển thị Space thuộc về người dùng hiện tại.                              | Base Requirement | Must have  |

---

### 1.3 Task — Công việc

| ID          | Yêu cầu                                                                                       | Nguồn gốc        | Độ ưu tiên  |
| ----------- | --------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-TASK-01  | Hệ thống cho phép người dùng tạo Task trong một Space (tiêu đề, mô tả, deadline, độ ưu tiên).| OBJ-02, PP-04    | Must have   |
| FR-TASK-02  | Hệ thống cho phép người dùng xem danh sách Task trong Space.                                 | OBJ-02           | Must have   |
| FR-TASK-03  | Hệ thống cho phép người dùng xem chi tiết một Task.                                          | OBJ-02           | Must have   |
| FR-TASK-04  | Hệ thống cho phép người dùng cập nhật thông tin Task.                                        | OBJ-02           | Must have   |
| FR-TASK-05  | Hệ thống cho phép người dùng xoá Task.                                                       | OBJ-02           | Must have   |
| FR-TASK-06  | Hệ thống cho phép thay đổi trạng thái Task (Todo / Doing / Done).                            | OBJ-02, PP-03    | Must have   |
| FR-TASK-07  | Hệ thống chỉ hiển thị Task thuộc về người dùng hiện tại.                                     | Base Requirement | Must have   |
| FR-TASK-08  | Hệ thống tự động cập nhật Dashboard khi Task có thay đổi.                                    | OBJ-05           | Must have   |
| FR-TASK-09  | Hệ thống cho phép tìm kiếm và lọc Task theo trạng thái, độ ưu tiên hoặc deadline.            | PP-02, PP-03     | Should have |
| FR-TASK-10  | Hệ thống cho phép gắn Tag để phân loại Task.                                                 | PP-03            | Should have |
| FR-TASK-11  | Hệ thống cho phép sắp xếp Task theo thời gian tạo hoặc deadline.                               | PP-03            | Should have |
| FR-TASK-12  | Hệ thống cho phép người dùng thêm danh sách mục con (checklist) vào một Task để chia nhỏ công việc. | OBJ-02, PP-03   | Should have |
| FR-TASK-13  | Hệ thống hỗ trợ phân trang khi danh sách Task có số lượng lớn.                               | Base Requirement | Could have  |

---

### 1.4 Note — Ghi chú

| ID          | Yêu cầu                                                                                       | Nguồn gốc        | Độ ưu tiên  |
| ----------- | --------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-NOTE-01  | Hệ thống cho phép người dùng tạo Note trong một Space (tiêu đề, nội dung văn bản/markdown).  | OBJ-02, PP-01    | Must have   |
| FR-NOTE-02  | Hệ thống cho phép người dùng xem danh sách Note trong Space.                                 | OBJ-02           | Must have   |
| FR-NOTE-03  | Hệ thống cho phép người dùng xem chi tiết một Note.                                          | OBJ-02           | Must have   |
| FR-NOTE-04  | Hệ thống cho phép người dùng cập nhật nội dung Note.                                         | OBJ-02           | Must have   |
| FR-NOTE-05  | Hệ thống cho phép người dùng xoá Note.                                                       | OBJ-02           | Must have   |
| FR-NOTE-06  | Hệ thống chỉ hiển thị Note thuộc về người dùng hiện tại.                                     | Base Requirement | Must have   |
| FR-NOTE-07  | Hệ thống cho phép gắn Tag để phân loại Note.                                                 | PP-03            | Should have |
| FR-NOTE-08  | Hệ thống cho phép tìm kiếm Note theo tiêu đề.                                                | PP-02            | Should have |
| FR-NOTE-09  | Hệ thống cho phép lọc Note theo Tag đã gắn.                                                  | PP-03            | Should have |
| FR-NOTE-10  | Hệ thống cho phép sắp xếp Note theo ngày tạo hoặc ngày cập nhật gần nhất.                    | PP-03            | Could have  |

---

### 1.5 Event — Sự kiện

| ID           | Yêu cầu                                                                                     | Nguồn gốc        | Độ ưu tiên  |
| ------------ | ------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-EVENT-01  | Hệ thống cho phép người dùng tạo Event trong một Space (tiêu đề, thời gian bắt đầu/kết thúc, mô tả). | OBJ-02, PP-04 | Must have   |
| FR-EVENT-02  | Hệ thống cho phép người dùng xem danh sách Event trong Space.                              | OBJ-02           | Must have   |
| FR-EVENT-03  | Hệ thống cho phép người dùng xem chi tiết một Event.                                       | OBJ-02           | Must have   |
| FR-EVENT-04  | Hệ thống cho phép người dùng cập nhật Event.                                               | OBJ-02           | Must have   |
| FR-EVENT-05  | Hệ thống cho phép người dùng xoá Event.                                                    | OBJ-02           | Must have   |
| FR-EVENT-06  | Hệ thống chỉ hiển thị Event thuộc về người dùng hiện tại.                                  | Base Requirement | Must have   |
| FR-EVENT-07  | Hệ thống cho phép tìm kiếm và lọc Event theo khoảng thời gian.                              | PP-02, PP-03     | Should have |

---

### 1.6 Reference — Tài liệu tham khảo

| ID          | Yêu cầu                                                                                       | Nguồn gốc        | Độ ưu tiên  |
| ----------- | --------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-REF-01   | Hệ thống cho phép người dùng thêm Reference vào một Space (URL hoặc file đính kèm, mô tả).  | OBJ-02, PP-05    | Must have   |
| FR-REF-02   | Hệ thống cho phép người dùng xem danh sách Reference trong Space.                            | OBJ-02           | Must have   |
| FR-REF-03   | Hệ thống cho phép người dùng xem chi tiết một Reference.                                     | OBJ-02           | Must have   |
| FR-REF-04   | Hệ thống cho phép người dùng cập nhật Reference.                                             | OBJ-02           | Must have   |
| FR-REF-05   | Hệ thống cho phép người dùng xoá Reference.                                                  | OBJ-02           | Must have   |
| FR-REF-06   | Hệ thống chỉ hiển thị Reference thuộc về người dùng hiện tại.                                | Base Requirement | Must have   |
| FR-REF-07   | Hệ thống cho phép gắn Tag để phân loại Reference.                                            | PP-05            | Should have |
| FR-REF-08   | Hệ thống cho phép tìm kiếm Reference theo tên hoặc URL.                                       | PP-02, PP-05     | Should have |

---

### 1.7 Relation — Liên kết giữa các nội dung

| ID          | Yêu cầu                                                                                       | Nguồn gốc        | Độ ưu tiên  |
| ----------- | --------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-REL-01   | Hệ thống cho phép tạo liên kết giữa 2 nội dung bất kỳ (Task/Note/Event/Reference), chọn loại quan hệ: contains / links-to / related-to. | OBJ-03, PP-03 | Must have   |
| FR-REL-02   | Hệ thống cho phép xem danh sách các nội dung đang liên kết với một nội dung cụ thể.          | OBJ-03           | Must have   |
| FR-REL-03   | Hệ thống cho phép xoá một liên kết.                                                          | OBJ-03           | Must have   |

---

### 1.8 View — Góc nhìn dữ liệu

| ID           | Yêu cầu                                                                                     | Nguồn gốc        | Độ ưu tiên  |
| ------------ | ------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-VIEW-01   | Hệ thống cung cấp Calendar View — các nội dung có thông tin thời gian (Task có deadline, Event có startAt) hiển thị theo ngày/tuần/tháng. | OBJ-04, PP-02 | Must have   |
| FR-VIEW-02   | Hệ thống cung cấp List View — toàn bộ nội dung trong một Space hiển thị dạng danh sách.    | OBJ-04           | Must have   |
| FR-VIEW-03   | Hệ thống cung cấp Board View — Task hiển thị dạng Kanban theo trạng thái (Todo / Doing / Done). | OBJ-04, PP-03 | Should have |

---

### 1.9 Dashboard — Tổng quan

| ID           | Yêu cầu                                                                                     | Nguồn gốc        | Độ ưu tiên  |
| ------------ | ------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-DASH-01   | Hệ thống hiển thị Task và Event sắp đến hạn trong 7 ngày tới trên toàn bộ Space.           | OBJ-05, PP-04    | Must have   |
| FR-DASH-02   | Hệ thống hiển thị tổng quan số lượng Task theo trạng thái trên toàn bộ Space.              | OBJ-05, PP-03    | Should have |
| FR-DASH-03   | Hệ thống hiển thị số lượng Task theo từng Space để người dùng nắm tổng quan tiến độ.       | OBJ-05, PP-03    | Should have |
| FR-DASH-04   | Hệ thống hiển thị danh sách Space truy cập gần đây.                                        | OBJ-05           | Should have |
| FR-DASH-05   | Hệ thống cho phép truy cập nhanh từ Dashboard đến Space, Task hoặc Event tương ứng.        | OBJ-05, PP-02    | Should have |
| FR-DASH-06   | Hệ thống cho phép lọc nội dung Dashboard theo khoảng thời gian cụ thể.                       | PP-03            | Could have  |
| FR-DASH-07   | Hệ thống hiển thị danh sách Note và Reference được truy cập hoặc cập nhật gần đây.          | PP-02, PP-05     | Could have  |

---

### 1.10 Notification — Nhắc nhở

| ID            | Yêu cầu                                                                                    | Nguồn gốc        | Độ ưu tiên  |
| ------------- | ------------------------------------------------------------------------------------------ | ---------------- | ----------- |
| FR-NOTIF-01   | Hệ thống tự động tạo thông báo khi Task hoặc Event sắp đến hạn.                           | OBJ-06, PP-04    | Must have   |
| FR-NOTIF-02   | Hệ thống hiển thị danh sách thông báo cho người dùng sau khi đăng nhập.                   | OBJ-06           | Must have   |
| FR-NOTIF-03   | Hệ thống chỉ hiển thị thông báo thuộc về người dùng hiện tại.                             | Base Requirement | Must have   |
| FR-NOTIF-04   | Hệ thống cho phép người dùng đánh dấu thông báo là đã đọc.                                | Base Requirement | Should have |
| FR-NOTIF-05   | Hệ thống cho phép người dùng cài đặt thời điểm nhắc nhở (nhắc trước bao nhiêu giờ/ngày trước deadline). | PP-04           | Should have |
| FR-NOTIF-06   | Hệ thống cho phép người dùng xoá thông báo không còn cần thiết.                           | Base Requirement | Could have  |

---

## 2. Non-Functional Requirements (Yêu cầu phi chức năng)

| ID           | Nhóm            | Yêu cầu                                                                                        | Tiêu chí kiểm tra                                            |
| ------------ | --------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| NFR-PERF-01  | Performance     | Thời gian phản hồi của API dưới 500ms trong điều kiện tải bình thường.                        | Đo thời gian phản hồi API trung bình < 500ms.                |
| NFR-PERF-02  | Performance     | Dashboard phải tải dữ liệu trong thời gian dưới 2 giây.                                       | Thời gian tải Dashboard < 2 giây.                            |
| NFR-SEC-01   | Security        | Mật khẩu người dùng phải được băm (Hash) trước khi lưu vào cơ sở dữ liệu.                    | Không tồn tại mật khẩu dạng văn bản thuần (Plain Text).     |
| NFR-SEC-02   | Security        | Hệ thống sử dụng JWT để xác thực người dùng.                                                  | API yêu cầu Access Token hợp lệ.                             |
| NFR-SEC-03   | Security        | Một Space và toàn bộ nội dung bên trong chỉ chính chủ sở hữu truy cập được.                  | Kiểm thử IDOR không truy cập được dữ liệu người khác.       |
| NFR-SEC-04   | Security        | Access Token có thời gian hết hạn và yêu cầu đăng nhập lại khi hết phiên.                    | Token hết hạn theo cấu hình hệ thống.                        |
| NFR-USE-01   | Usability       | Giao diện đơn giản, thống nhất giữa các chức năng.                                            | Người dùng thực hiện được các chức năng chính mà không cần hướng dẫn. |
| NFR-RESP-01  | Responsive      | Giao diện hoạt động trên màn hình từ 375px trở lên.                                           | Kiểm thử trên Mobile và Desktop.                             |
| NFR-RESP-02  | Responsive      | Các thành phần giao diện tự điều chỉnh theo kích thước màn hình.                              | Không bị vỡ giao diện ở các breakpoint.                      |
| NFR-MAIN-01  | Maintainability | Mã nguồn được tổ chức theo kiến trúc phân lớp Controller – Service – Repository.              | Các layer được tách biệt rõ ràng.                            |
| NFR-MAIN-02  | Maintainability | Có tài liệu API (Swagger) để tra cứu.                                                         | Swagger hoạt động và đúng với API thật.                      |
| NFR-SCALE-01 | Scalability     | Có thể thêm loại nội dung mới trong tương lai mà không phải sửa cấu trúc Space hoặc Relation. | Thêm loại Item mới không ảnh hưởng các module hiện có.       |
| NFR-RELI-01  | Reliability     | Hệ thống đảm bảo tính toàn vẹn dữ liệu khi thực hiện CRUD.                                   | Không phát sinh dữ liệu không hợp lệ.                        |
| NFR-RELI-02  | Reliability     | Hệ thống xử lý ngoại lệ và trả về thông báo lỗi phù hợp.                                     | API trả đúng HTTP Status và Error Message.                   |
| NFR-COMP-01  | Compatibility   | Hệ thống hoạt động trên các trình duyệt phổ biến (Chrome, Edge, Firefox).                    | Kiểm thử trên các trình duyệt được hỗ trợ.                   |

---

## 3. Business Rules tổng quan

> *(Chi tiết Business Rules cho từng API endpoint nằm ở [07_API_Design.md](07_API_Design.md))*

**Auth**
- Email đăng ký phải duy nhất trong hệ thống.
- Mật khẩu tối thiểu 8 ký tự.

**Space**
- Tên Space không được để trống.
- Xoá Space sẽ xoá toàn bộ nội dung và Relation bên trong (cascade) — bắt buộc xác nhận trước khi xoá.
- Mỗi Space phải thuộc đúng một người dùng.

**Task**
- `title` không được để trống.
- `dueDate` (nếu có) không được ở quá khứ khi tạo mới.
- Trạng thái chỉ chuyển theo thứ tự: Todo → Doing → Done.

**Note**
- `title` không được để trống.

**Event**
- `startAt` phải nhỏ hơn `endAt`.
- `startAt` không được ở quá khứ khi tạo mới.

**Reference**
- Phải có ít nhất URL hoặc file đính kèm, không được để trống cả hai.

**Relation**
- Không tạo Relation giữa một nội dung với chính nó.
- Không tạo trùng lặp 2 Relation cùng loại giữa cùng một cặp nội dung.

**Notification**
- Không tạo thông báo mới cho Task đã ở trạng thái Done.
- Thông báo chỉ được tạo cho Task có `dueDate` hoặc Event có `startAt`.
- Chỉ hiển thị thông báo thuộc về người dùng hiện tại.

---

*Tiếp theo: [03_Functional_Analysis.md](03_Functional_Analysis.md)*
*Quay lại mục lục: [docs/README.md](README.md)*
