# 02_Requirement.md — Yêu cầu hệ thống

> Tài liệu trước: [01_Research.md](01_Research.md)
> Tài liệu sau: [03_Functional_Analysis.md](03_Functional_Analysis.md)

---

## Liên kết với Objectives

| Objective (từ 01_Research)                                                | Nhóm FR liên quan                  |
| ------------------------------------------------------------------------- | ---------------------------------- |
| OBJ-01 — Tự tạo Space theo chủ đề riêng                                   | FR-SPACE                           |
| OBJ-02 — Quản lý Task / Note / Event / Reference tồn tại độc lập (Object) | FR-TASK, FR-NOTE, FR-EVENT, FR-REF |
| OBJ-03 — Đặt Object vào nhiều Space theo ngữ cảnh                         | FR-PLACEMENT                       |
| OBJ-04 — Liên kết ngữ nghĩa giữa các Object (Relation)                    | FR-REL                             |
| OBJ-05 — Nhiều góc nhìn (View) trên cùng dữ liệu                          | FR-VIEW                            |
| OBJ-06 — Dashboard tổng quan                                              | FR-DASH                            |
| OBJ-07 — Nhắc nhở tự động                                                 | FR-NOTIF                           |
| OBJ-08 — Hỗ trợ lập kế hoạch (phụ thuộc, gợi ý hôm nay)                   | FR-PLAN                            |
| OBJ-09 — Hỗ trợ học tập (ôn tập ngắt quãng, tập trung)                    | FR-STUDY                           |
| OBJ-10 — Mạng tri thức (liên kết nhanh, bản đồ)                           | FR-KNOW                            |
| Quản trị hệ thống, báo cáo, xuất dữ liệu                                  | FR-ADMIN, FR-EXT                   |

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
| FR-AUTH-10  | Hệ thống khoá đăng nhập tạm 15 phút sau 5 lần sai liên tiếp và giới hạn tần suất gọi API. | Base Requirement | Should have |

---

### 1.2 Space — Không gian quản lý

| ID          | Yêu cầu                                                                                | Nguồn gốc        | Độ ưu tiên |
| ----------- | -------------------------------------------------------------------------------------- | ---------------- | ---------- |
| FR-SPACE-01 | Hệ thống cho phép người dùng tạo Space mới (tên và mô tả).                             | OBJ-01, PP-06    | Must have  |
| FR-SPACE-02 | Hệ thống cho phép người dùng xem danh sách Space của mình.                             | OBJ-01           | Must have  |
| FR-SPACE-03 | Hệ thống cho phép người dùng xem toàn bộ nội dung bên trong một Space.                 | OBJ-01           | Must have  |
| FR-SPACE-04 | Hệ thống cho phép người dùng cập nhật thông tin Space (đổi tên).                       | OBJ-01           | Must have  |
| FR-SPACE-05 | Hệ thống cho phép xoá Space; các Object bên trong **không bị xoá** (Object không còn ở Space nào thì về Hộp nhận). | OBJ-01           | Must have  |
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
| FR-TASK-11  | Hệ thống cho phép sắp xếp Task theo thời gian tạo hoặc deadline.                               | PP-03            | Should have |
| FR-TASK-12  | Hệ thống cho phép chia một Task thành các **việc con** (liên kết `PARENT_OF`), tiến độ việc cha tự tính. | OBJ-02, PP-03   | Should have |
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
| FR-NOTE-08  | Hệ thống cho phép tìm kiếm Note theo tiêu đề.                                                | PP-02            | Should have |
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
| FR-REF-08   | Hệ thống cho phép tìm kiếm Reference theo tên hoặc URL.                                       | PP-02, PP-05     | Should have |

---

### 1.7 Placement — Đặt Object vào Space

| ID              | Yêu cầu                                                                                                                              | Nguồn gốc        | Độ ưu tiên  |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-PLACE-01     | Hệ thống cho phép người dùng đặt một Object vào một Space.                                                                      | OBJ-03           | Must have   |
| FR-PLACE-02     | Hệ thống cho phép người dùng đặt cùng một Object vào nhiều Space khác nhau mà không sao chép dữ liệu.                            | OBJ-03, PP-01    | Must have   |
| FR-PLACE-03     | Hệ thống cho phép người dùng gỡ một Object khỏi Space mà không xóa Object đó — Object vẫn tồn tại nhưng không gắn với Space nữa. | OBJ-03           | Must have   |
| FR-PLACE-04     | Hệ thống hiển thị danh sách các Space mà một Object đang được đặt vào.                                                         | OBJ-03           | Should have |
| FR-PLACE-05     | Hệ thống cung cấp khu vực xem các Object chưa được đặt vào Space nào (Unassigned).                                               | OBJ-03, PP-03    | Should have |

---

### 1.8 Relation — Liên kết giữa các Object

| ID          | Yêu cầu                                                                                                                                       | Nguồn gốc        | Độ ưu tiên  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ----------- |
| FR-REL-01   | Hệ thống cho phép tạo liên kết giữa 2 Object bất kỳ và đặt nhãn tự do cho mối liên kết (ờ dụ: “tham khảo”, “liên quan”, “cần làm trước”). | OBJ-04, PP-03    | Must have   |
| FR-REL-02   | Hệ thống cho phép xem danh sách các Object đang liên kết với một Object cụ thể (cả 2 chiều đi ra và đi vào).            | OBJ-04           | Must have   |
| FR-REL-03   | Hệ thống cho phép xoá một liên kết.                                                                                              | OBJ-04           | Must have   |

---

### 1.9 View — Góc nhìn dữ liệu

| ID           | Yêu cầu                                                                                     | Nguồn gốc        | Độ ưu tiên  |
| ------------ | ------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-VIEW-01   | Hệ thống cung cấp Calendar View — các Object có dữ liệu thời gian (Task có dueDate, Event có startAt) hiển thị theo ngày/tuần/tháng. | OBJ-05, PP-02 | Must have   |
| FR-VIEW-02   | Hệ thống cung cấp List View — toàn bộ Object trong một Space hiển thị dạng danh sách.    | OBJ-05           | Must have   |
| FR-VIEW-03   | Hệ thống cung cấp Board View — Task hiển thị dạng Kanban theo trạng thái (Todo / Doing / Done). | OBJ-05, PP-03 | Should have |

---

### 1.10 Dashboard — Tổng quan

| ID           | Yêu cầu                                                                                     | Nguồn gốc        | Độ ưu tiên  |
| ------------ | ------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-DASH-01   | Hệ thống hiển thị Task và Event sắp đến hạn trong 7 ngày tới trên toàn bộ Space.           | OBJ-06, PP-04    | Must have   |
| FR-DASH-02   | Hệ thống hiển thị tổng quan số lượng Task theo trạng thái trên toàn bộ Space.              | OBJ-06, PP-03    | Should have |
| FR-DASH-03   | Hệ thống hiển thị số lượng Task theo từng Space để người dùng nắm tổng quan tiến độ.       | OBJ-06, PP-03    | Should have |
| FR-DASH-04   | Hệ thống hiển thị danh sách Space truy cập gần đây.                                        | OBJ-06           | Should have |
| FR-DASH-05   | Hệ thống cho phép truy cập nhanh từ Dashboard đến Space, Task hoặc Event tương ứng.        | OBJ-06, PP-02    | Should have |
| FR-DASH-06   | Hệ thống cho phép lọc nội dung Dashboard theo khoảng thời gian cụ thể.                       | PP-03            | Could have  |
| FR-DASH-07   | Hệ thống hiển thị danh sách Note và Reference được truy cập hoặc cập nhật gần đây.          | PP-02, PP-05     | Could have  |

---

### 1.11 Notification — Nhắc nhở

| ID            | Yêu cầu                                                                                    | Nguồn gốc        | Độ ưu tiên  |
| ------------- | ------------------------------------------------------------------------------------------ | ---------------- | ----------- |
| FR-NOTIF-01   | Hệ thống tự động tạo thông báo khi Task hoặc Event sắp đến hạn.                           | OBJ-06, PP-04    | Must have   |
| FR-NOTIF-02   | Hệ thống hiển thị danh sách thông báo cho người dùng sau khi đăng nhập.                   | OBJ-06           | Must have   |
| FR-NOTIF-03   | Hệ thống chỉ hiển thị thông báo thuộc về người dùng hiện tại.                             | Base Requirement | Must have   |
| FR-NOTIF-04   | Hệ thống cho phép người dùng đánh dấu thông báo là đã đọc.                                | Base Requirement | Should have |
| FR-NOTIF-05   | Hệ thống cho phép người dùng cài đặt thời điểm nhắc nhở (nhắc trước bao nhiêu giờ/ngày trước deadline). | PP-04           | Should have |
| FR-NOTIF-06   | Hệ thống cho phép người dùng xoá thông báo không còn cần thiết.                           | Base Requirement | Could have  |

### 1.12 Plan — Trụ Kế hoạch

| ID          | Yêu cầu                                                                                                            | Độ ưu tiên  |
| ----------- | ------------------------------------------------------------------------------------------------------------------ | ----------- |
| FR-PLAN-01  | Hệ thống cho phép đặt quan hệ "phụ thuộc" giữa các Task; Task bị chặn hiển thị 🔒 và không được gợi ý làm.        | Must have   |
| FR-PLAN-02  | Hệ thống **cấm tạo vòng phụ thuộc** (kể cả gián tiếp).                                                             | Must have   |
| FR-PLAN-03  | Hệ thống gợi ý "Hôm nay làm gì?" tối đa 5 việc, xếp theo hạn chót, ưu tiên, việc đang làm dở, việc mở khoá được việc khác; kèm lý do. | Must have   |
| FR-PLAN-04  | Hệ thống cho đặt thời gian ước lượng cho Task và cảnh báo quá tải trong 7 ngày tới.                                | Should have |
| FR-PLAN-05  | Hệ thống hỗ trợ Task / Event **lặp lại** (ngày, tuần, tháng, mỗi N, hạn kết thúc); Task xong thì tự sinh lần kế tiếp. | Should have |
| FR-PLAN-06  | Hệ thống cảnh báo khi dời hạn một việc làm các việc đang chờ nó bị trễ theo.                                       | Should have |
| FR-PLAN-07  | Hệ thống báo "việc đã được mở khoá" khi mọi việc phải làm trước đã xong.                                           | Should have |

### 1.13 Study — Trụ Học tập

| ID           | Yêu cầu                                                                                                  | Độ ưu tiên  |
| ------------ | -------------------------------------------------------------------------------------------------------- | ----------- |
| FR-STUDY-01  | Hệ thống tạo thẻ ôn tập từ các dòng `Câu hỏi :: Trả lời` trong Note; đồng bộ khi sửa, giữ tiến độ thẻ cũ. | Must have   |
| FR-STUDY-02  | Hệ thống xếp lịch ôn bằng thuật toán SM-2; người dùng tự chấm Quên/Khó/Nhớ/Dễ; hiển thị lần ôn kế tiếp.  | Must have   |
| FR-STUDY-03  | Hệ thống ưu tiên ôn thẻ của Note liên kết với việc sắp đến hạn (ôn theo ngữ cảnh).                        | Should have |
| FR-STUDY-04  | Hệ thống có đồng hồ tập trung (Pomodoro) và ghi thời gian học thật.                                       | Should have |
| FR-STUDY-05  | Hệ thống thống kê số thẻ cần ôn, lượt ôn, chuỗi ngày học, phút tập trung 7 ngày.                          | Should have |

### 1.14 Know — Trụ Tri thức

| ID          | Yêu cầu                                                                                                  | Độ ưu tiên  |
| ----------- | -------------------------------------------------------------------------------------------------------- | ----------- |
| FR-KNOW-01  | Hệ thống hỗ trợ gõ `[[Tiêu đề]]` (có gợi ý) để tự tạo liên kết; bỏ nhắc thì liên kết tự xoá, liên kết tạo tay được giữ. | Must have   |
| FR-KNOW-02  | Hệ thống hiển thị backlink: những mục đang liên kết tới mục này.                                         | Must have   |
| FR-KNOW-03  | Hệ thống hiển thị **bản đồ tri thức** (nút = mục, cạnh = liên kết), lọc theo Không gian/loại, xem quanh một mục. | Should have |
| FR-KNOW-04  | Hệ thống hiển thị Markdown cho nội dung Note một cách an toàn (không chạy HTML thô).                     | Should have |

### 1.15 Admin — Quản trị

| ID           | Yêu cầu                                                                                                   | Độ ưu tiên  |
| ------------ | --------------------------------------------------------------------------------------------------------- | ----------- |
| FR-ADMIN-01  | Quản trị viên xem danh sách tài khoản (tìm kiếm, phân trang) với số lượng Không gian/mục.                 | Must have   |
| FR-ADMIN-02  | Quản trị viên khoá/mở khoá tài khoản (không tự khoá mình, không khoá Admin khác).                         | Must have   |
| FR-ADMIN-03  | Quản trị viên xem thống kê tổng hợp (người dùng, mục theo loại, hoạt động 14 ngày).                       | Should have |
| FR-ADMIN-04  | Quản trị viên gửi thông báo hệ thống tới mọi người dùng; mọi hành động được ghi nhật ký.                  | Should have |
| FR-ADMIN-05  | Quản trị viên **không** xem được nội dung cá nhân của người dùng (tiêu đề, nội dung, URL, tên Không gian). | Must have   |

### 1.16 Ext — Mở rộng

| ID         | Yêu cầu                                                                                               | Độ ưu tiên  |
| ---------- | ----------------------------------------------------------------------------------------------------- | ----------- |
| FR-EXT-01  | Hệ thống xuất lịch `.ics` (địa chỉ riêng có token) để Google Calendar / điện thoại tự nhắc.           | Should have |
| FR-EXT-02  | Hệ thống có báo cáo tuần (việc xong, đúng hạn, lượt ôn, phút tập trung, so với tuần trước).           | Should have |
| FR-EXT-03  | Hệ thống tạo Không gian từ mẫu dựng sẵn (Môn học, Đồ án, Freelance).                                  | Could have  |
| FR-EXT-04  | Hệ thống cho tải toàn bộ dữ liệu cá nhân dạng JSON (không gồm mật khẩu/token).                        | Should have |

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
| NFR-SEC-05   | Security        | Chống dò mật khẩu: khoá tạm sau 5 lần sai; giới hạn tần suất; header bảo mật (helmet); token đặt lại mật khẩu chỉ lưu băm. | Có test API tương ứng.                |
| NFR-SEC-06   | Security        | Quản trị viên không đọc được nội dung cá nhân của người dùng.                                  | Test: mọi API admin không chứa tiêu đề/nội dung/URL.         |
| NFR-RESP-01  | Responsive      | Giao diện hoạt động trên màn hình từ 375px trở lên.                                           | Kiểm thử trên Mobile và Desktop.                             |
| NFR-RESP-02  | Responsive      | Các thành phần giao diện tự điều chỉnh theo kích thước màn hình.                              | Không bị vỡ giao diện ở các breakpoint.                      |
| NFR-MAIN-01  | Maintainability | Mã nguồn tổ chức theo module NestJS: Controller – Service – Prisma (Prisma đóng vai trò Repository); thuật toán tách thành hàm thuần. | Các layer tách biệt; hàm thuần có unit test. |
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
- Sai mật khẩu 5 lần thì khoá đăng nhập tạm 15 phút; mọi lý do đăng nhập thất bại dùng một thông báo chung.

**Space**
- Tên Space không được để trống.
- Xoá Space chỉ xoá các bản ghi gán (`SpaceObject`); **Object không bị xoá** — không còn Space nào thì về Hộp nhận.
- Mỗi Space phải thuộc đúng một người dùng.

**Object — Vòng đời**
- Mỗi Object thuộc đúng một người dùng, xác định qua `ownerId`.
- Object có thể tồn tại mà không được đặt vào Space nào (Unassigned).
- Vòng đời lưu ở cột `lifecycle` (ACTIVE / ARCHIVED / TRASH); `archivedAt`, `deletedAt` chỉ ghi thời điểm. Chỉ đổi qua API `lifecycle`.
- Khôi phục từ Thùng rác về đúng trạng thái trước đó; chỉ xoá vĩnh viễn được mục đang ở Thùng rác.
- Permanent Delete: xóa cứng Object + cascade xóa `SpaceObject` và `Relation` liên quan.
- Không thể Archive hoặc Trash một Object đã bị Permanently Deleted.

**Placement (SpaceObject)**
- Một Object có thể được đặt vào nhiều Space khác nhau cùng lúc.
- Một Object chỉ xuất hiện tối đa một lần trong mỗi Space (unique constraint trên cặp spaceId + objectId).
- Gỡ Object khỏi Space chỉ xóa bản ghi SpaceObject, không ảnh hưởng đến Object hay các Space khác.

**Task**
- `title` không được để trống.
- `dueDate` có thể ở quá khứ (ghi lại việc đã trễ); giao diện chỉ cảnh báo nhẹ, không chặn.
- Trạng thái chuyển **tự do** giữa Todo / Doing / Done / Cancelled (Kanban kéo thả, nút tick).
- Chỉ Task có `status`, `priority`, `estimatedMinutes`, `dueDate`; Note và Reference không có.

**Note**
- `title` không được để trống.

**Event**
- `startAt` bắt buộc; `endAt` (nếu có) phải sau `startAt`. Cho phép ghi lại sự kiện đã diễn ra.

**Reference**
- Phải có ít nhất URL hoặc file đính kèm, không được để trống cả hai.

**Relation**
- Không tạo Relation giữa một Object với chính nó.
- Không tạo trùng lặp 2 Relation có cùng nhãn giữa cùng một cặp Object.
- Loại liên kết là một trong 4 loại cố định: `RELATES_TO`, `REFERENCES`, `DEPENDS_ON`, `PARENT_OF`.
- `DEPENDS_ON` và `PARENT_OF` chỉ giữa các Task, **không được tạo vòng**; một Task chỉ có một việc cha.
- Không liên kết với Object trong Thùng rác.

**Notification**
- Không tạo thông báo mới cho Task đã ở trạng thái Done.
- Thông báo chỉ được tạo cho Task có `dueDate` hoặc Event có `startAt`.
- Chỉ hiển thị thông báo thuộc về người dùng hiện tại.

---

*Tiếp theo: [03_Functional_Analysis.md](03_Functional_Analysis.md)*
*Quay lại mục lục: [docs/README.md](README.md)*
