# 02_Requirement.md — Yêu cầu hệ thống

> Tài liệu trước: [01_Research.md](01_Research.md)
> Tài liệu sau: [03_Functional_Analysis.md](03_Functional_Analysis.md)
> Trạng thái: Hoàn thành

---
## 1. Functional Requirements (Yêu cầu chức năng)

### 1.1 Auth — Xác thực & Phiên đăng nhập

| ID         | Yêu cầu                                                                                   | Nguồn gốc        | Độ ưu tiên  |
| ---------- | ----------------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-AUTH-01 | Hệ thống cho phép người dùng đăng ký tài khoản bằng họ tên, email và mật khẩu.            | Base Requirement | Must have   |
| FR-AUTH-02 | Hệ thống cho phép người dùng đăng nhập bằng email và mật khẩu.                            | Base Requirement | Must have   |
| FR-AUTH-03 | Hệ thống xác thực thông tin đăng nhập trước khi cho phép truy cập hệ thống.               | Base Requirement | Must have   |
| FR-AUTH-04 | Hệ thống cho phép người dùng đăng xuất khỏi hệ thống.                                     | Base Requirement | Must have   |
| FR-AUTH-05 | Hệ thống cho phép người dùng xem thông tin tài khoản cá nhân.                             | Base Requirement | Must have   |
| FR-AUTH-06 | Hệ thống cho phép người dùng cập nhật thông tin cá nhân.                                  | Base Requirement | Should have |
| FR-AUTH-07 | Hệ thống cho phép người dùng thay đổi mật khẩu sau khi đăng nhập.                         | Base Requirement | Should have |
| FR-AUTH-08 | Hệ thống không cho phép truy cập các chức năng khi người dùng chưa đăng nhập.             | Base Requirement | Must have   |
| FR-AUTH-09 | Hệ thống cho phép người dùng yêu cầu đặt lại mật khẩu khi quên mật khẩu.                  | Base Requirement | Could have  |
| FR-AUTH-10 | Hệ thống cho phép người dùng đặt lại mật khẩu thông qua liên kết hoặc mã xác thực hợp lệ. | Base Requirement | Could have  |

---

### 1.2 Task — Quản lý công việc

| ID         | Yêu cầu                                                                                 | Nguồn gốc        | Độ ưu tiên  |
| ---------- | --------------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-TASK-01 | Hệ thống cho phép người dùng tạo công việc mới.                                         | OBJ-01, PP-06      | Must have   |
| FR-TASK-02 | Hệ thống cho phép người dùng chỉnh sửa thông tin công việc.                             | OBJ-01            | Must have   |
| FR-TASK-03 | Hệ thống cho phép người dùng xóa công việc.                                             | OBJ-01            | Must have   |
| FR-TASK-04 | Hệ thống cho phép người dùng xem danh sách công việc.                                   | OBJ-01            | Must have   |
| FR-TASK-05 | Hệ thống cho phép người dùng xem chi tiết một công việc.                                | OBJ-01            | Must have   |
| FR-TASK-06 | Hệ thống cho phép thiết lập thời hạn hoàn thành (Deadline) cho công việc.               | OBJ-01, PP-04      | Must have   |
| FR-TASK-07 | Hệ thống cho phép thiết lập mức độ ưu tiên của công việc.                               | OBJ-01            | Must have   |
| FR-TASK-08 | Hệ thống cho phép thay đổi trạng thái công việc (To do, In Progress, Done).             | OBJ-01, PP-03      | Must have   |
| FR-TASK-09 | Hệ thống cho phép tìm kiếm công việc theo tên.                                          | PP-02             | Should have |
| FR-TASK-10 | Hệ thống cho phép lọc công việc theo trạng thái.                                        | PP-03             | Should have |
| FR-TASK-11 | Hệ thống cho phép lọc công việc theo mức độ ưu tiên.                                    | PP-03             | Should have |
| FR-TASK-12 | Hệ thống cho phép sắp xếp công việc theo thời gian tạo hoặc deadline.                   | PP-03             | Should have |
| FR-TASK-13 | Hệ thống cho phép đính kèm một hoặc nhiều tài liệu tham khảo vào công việc.             | OBJ-04, PP-05      | Must have   |
| FR-TASK-14 | Hệ thống cho phép liên kết công việc với lịch trình cá nhân.                            | OBJ-03            | Must have   |
| FR-TASK-15 | Hệ thống hỗ trợ hiển thị công việc theo dạng bảng Kanban.                               | PP-03             | Should have |
| FR-TASK-16 | Hệ thống chỉ hiển thị các công việc thuộc về người dùng hiện tại.                       | Base Requirement | Must have   |
| FR-TASK-17 | Hệ thống tự động cập nhật thông tin công việc trên Dashboard sau khi có thay đổi.       | OBJ-05            | Must have   |
| FR-TASK-18 | Hệ thống hỗ trợ phân trang khi danh sách công việc có số lượng lớn.                     | Base Requirement | Could have  |
| FR-TASK-19 | Hệ thống cho phép tạo và quản lý công việc con (Sub-task) thuộc một công việc chính.    | OBJ-01            | Should have |
| FR-TASK-20 | Hệ thống cho phép gắn nhãn (Tag/Label) cho công việc nhằm hỗ trợ phân loại và tìm kiếm. | OBJ-01, PP-03      | Should have |

---

### 1.3 Learning — Quản lý nội dung học tập

| ID          | Yêu cầu                                                                                          | Nguồn gốc        | Độ ưu tiên  |
| ----------- | ------------------------------------------------------------------------------------------------ | ---------------- | ----------- |
| FR-LEARN-01 | Hệ thống cho phép người dùng tạo nội dung học tập mới.                                           | OBJ-02            | Must have   |
| FR-LEARN-02 | Hệ thống cho phép chỉnh sửa nội dung học tập.                                                    | OBJ-02            | Must have   |
| FR-LEARN-03 | Hệ thống cho phép xóa nội dung học tập.                                                          | OBJ-02            | Must have   |
| FR-LEARN-04 | Hệ thống cho phép xem danh sách nội dung học tập.                                                | OBJ-02            | Must have   |
| FR-LEARN-05 | Hệ thống cho phép tổ chức nội dung học tập theo chủ đề hoặc khóa học.                            | OBJ-02, PP-06      | Must have   |
| FR-LEARN-06 | Hệ thống cho phép theo dõi tiến độ học tập của từng chủ đề hoặc khóa học.                        | OBJ-02, PP-03      | Must have   |
| FR-LEARN-07 | Hệ thống cho phép thiết lập mục tiêu hoặc thời hạn hoàn thành nội dung học tập.                  | OBJ-02, PP-04      | Should have |
| FR-LEARN-08 | Hệ thống cho phép liên kết tài liệu tham khảo với nội dung học tập.                              | OBJ-04, PP-05      | Must have   |
| FR-LEARN-09 | Hệ thống cho phép tìm kiếm nội dung học tập theo tên.                                            | PP-02             | Should have |
| FR-LEARN-10 | Hệ thống cho phép lọc nội dung học tập theo trạng thái hoặc tiến độ.                             | PP-03             | Should have |
| FR-LEARN-11 | Hệ thống cho phép hiển thị lộ trình học tập theo cấu trúc phân cấp.                              | OBJ-02            | Should have |
| FR-LEARN-12 | Hệ thống chỉ hiển thị nội dung học tập thuộc về người dùng hiện tại.                             | Base Requirement | Must have   |
| FR-LEARN-13 | Hệ thống tự động cập nhật Dashboard khi tiến độ học tập thay đổi.                                | OBJ-05            | Must have   |
| FR-LEARN-14 | Hệ thống hỗ trợ phân trang khi danh sách nội dung học tập có số lượng lớn.                       | Base Requirement | Could have  |
| FR-LEARN-15 | Hệ thống cho phép chia nội dung học tập thành nhiều bài học hoặc mốc học tập (Lesson/Milestone). | OBJ-02            | Should have |

---

### 1.4 Calendar — Lịch trình cá nhân

| ID        | Yêu cầu                                                                         | Nguồn gốc        | Độ ưu tiên  |
| --------- | ------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-CAL-01 | Hệ thống cho phép người dùng tạo sự kiện trên lịch cá nhân.                     | OBJ-03            | Must have   |
| FR-CAL-02 | Hệ thống cho phép chỉnh sửa thông tin sự kiện.                                  | OBJ-03            | Must have   |
| FR-CAL-03 | Hệ thống cho phép xóa sự kiện.                                                  | OBJ-03            | Must have   |
| FR-CAL-04 | Hệ thống cho phép hiển thị lịch theo ngày hoặc tháng.                           | OBJ-03            | Must have   |
| FR-CAL-05 | Hệ thống cho phép liên kết sự kiện với Task hoặc Learning.                      | OBJ-03, PP-03      | Must have   |
| FR-CAL-06 | Hệ thống hiển thị các deadline của Task và Learning trên lịch.                  | OBJ-03, PP-04      | Must have   |
| FR-CAL-07 | Hệ thống chỉ hiển thị lịch và sự kiện của người dùng hiện tại.                  | Base Requirement | Must have   |
| FR-CAL-08 | Hệ thống tự động cập nhật lịch khi Task hoặc Learning có thay đổi về thời gian. | OBJ-05            | Should have |

---

### 1.5 Reference — Tài liệu tham khảo

| ID        | Yêu cầu                                                                                            | Nguồn gốc        | Độ ưu tiên  |
| --------- | -------------------------------------------------------------------------------------------------- | ---------------- | ----------- |
| FR-REF-01 | Hệ thống cho phép người dùng tạo tài liệu tham khảo (Reference).                                   | OBJ-04           | Must have   |
| FR-REF-02 | Hệ thống cho phép cập nhật thông tin tài liệu tham khảo.                                           | Base Requirement | Must have   |
| FR-REF-03 | Hệ thống cho phép xóa tài liệu tham khảo.                                                          | Base Requirement | Must have   |
| FR-REF-04 | Hệ thống cho phép lưu liên kết (URL) đến các nguồn như Google Drive, GitHub, YouTube hoặc Website. | PP-05, OBJ-04     | Must have   |
| FR-REF-05 | Hệ thống cho phép đính kèm một hoặc nhiều Reference vào Task.                                      | PP-01, OBJ-04     | Must have   |
| FR-REF-06 | Hệ thống cho phép đính kèm một hoặc nhiều Reference vào Learning.                                  | PP-01, OBJ-04     | Must have   |
| FR-REF-07 | Hệ thống cho phép tìm kiếm Reference theo tên.                                                     | PP-05             | Should have |
| FR-REF-08 | Hệ thống cho phép gắn Tag để phân loại Reference.                                                  | PP-05             | Should have |
| FR-REF-09 | Hệ thống hiển thị Reference dưới dạng thẻ (Card) gồm tiêu đề, liên kết và mô tả ngắn.              | PP-05             | Could have  |
| FR-REF-10 | Hệ thống cho phép lưu Reference độc lập trước khi gắn vào Task hoặc Learning.                      | PP-01, PP-05       | Could have  |

---

### 1.6 Dashboard — Tổng quan

| ID         | Yêu cầu                                                                                                   | Nguồn gốc          | Độ ưu tiên  |
| ---------- | --------------------------------------------------------------------------------------------------------- | ------------------ | ----------- |
| FR-DASH-01 | Hệ thống hiển thị tổng quan các Task cần thực hiện trong ngày.                                            | OBJ-05             | Must have   |
| FR-DASH-02 | Hệ thống hiển thị các nội dung Learning đang thực hiện hoặc sắp đến hạn.                                  | OBJ-05             | Must have   |
| FR-DASH-03 | Hệ thống hiển thị các sự kiện trong ngày từ Calendar.                                                     | OBJ-05             | Must have   |
| FR-DASH-04 | Hệ thống hiển thị các công việc hoặc hoạt động sắp đến hạn.                                               | PP-03, PP-04, OBJ-05 | Must have   |
| FR-DASH-05 | Hệ thống hiển thị thống kê tổng quan về Task và Learning (Tổng số, Đang thực hiện, Hoàn thành...).        | PP-03               | Should have |
| FR-DASH-06 | Hệ thống cho phép truy cập nhanh từ Dashboard đến Task, Learning hoặc Calendar tương ứng.                 | PP-02, OBJ-05       | Should have |
| FR-DASH-07 | Hệ thống cho phép lọc nội dung hiển thị theo ngày hoặc khoảng thời gian.                                  | PP-03               | Could have  |
| FR-DASH-08 | Hệ thống hiển thị danh sách các Reference được sử dụng gần đây hoặc liên quan đến các công việc hiện tại. | PP-05               | Could have  |

---

### 1.7 Notification — Nhắc nhở

|ID|Yêu cầu|Nguồn gốc|Độ ưu tiên|
|---|---|---|---|
|FR-NOTIF-01|Hệ thống tự động tạo thông báo khi Task hoặc Learning sắp đến hạn.|OBJ-06, PP-04|Must have|
|FR-NOTIF-02|Hệ thống hiển thị danh sách các thông báo cho người dùng sau khi đăng nhập.|OBJ-06|Must have|
|FR-NOTIF-03|Hệ thống cho phép người dùng đánh dấu thông báo là đã đọc.|Base Requirement|Should have|
|FR-NOTIF-04|Hệ thống chỉ hiển thị các thông báo thuộc về chính người dùng hiện tại.|Base Requirement|Must have|
|FR-NOTIF-05|Hệ thống cho phép người dùng xóa thông báo không còn cần thiết.|Base Requirement|Could have|
|FR-NOTIF-06|Hệ thống hỗ trợ gửi thông báo qua email đối với các sự kiện hoặc deadline quan trọng (nếu được cấu hình SMTP).|OBJ-06|Could have|

---

## 2. Non-Functional Requirements (Yêu cầu phi chức năng)

|ID|Nhóm|Yêu cầu|Tiêu chí kiểm tra|
|---|---|---|---|
|NFR-PERF-01|Performance|Thời gian phản hồi của API dưới 500 ms trong điều kiện tải bình thường.|Đo thời gian phản hồi API trung bình < 500 ms.|
|NFR-PERF-02|Performance|Dashboard phải tải dữ liệu trong thời gian dưới 3 giây.|Thời gian tải Dashboard < 3 giây.|
|NFR-SEC-01|Security|Mật khẩu người dùng phải được băm (Hash) trước khi lưu vào cơ sở dữ liệu.|Không tồn tại mật khẩu dạng văn bản thuần (Plain Text).|
|NFR-SEC-02|Security|Hệ thống sử dụng JWT để xác thực người dùng.|API yêu cầu Access Token hợp lệ.|
|NFR-SEC-03|Security|Người dùng chỉ được truy cập dữ liệu thuộc về chính mình.|Kiểm thử IDOR không truy cập được dữ liệu người khác.|
|NFR-SEC-04|Security|Access Token có thời gian hết hạn và yêu cầu đăng nhập lại khi hết phiên.|Token hết hạn theo cấu hình hệ thống.|
|NFR-USE-01|Usability|Giao diện đơn giản, thống nhất giữa các chức năng.|Người dùng thực hiện được các chức năng chính mà không cần hướng dẫn.|
|NFR-USE-02|Usability|Các thao tác CRUD được thực hiện trực quan, dễ sử dụng.|Hoàn thành thao tác trong số bước hợp lý.|
|NFR-RESP-01|Responsive|Giao diện hoạt động trên màn hình từ 375 px trở lên.|Kiểm thử trên Mobile và Desktop.|
|NFR-RESP-02|Responsive|Các thành phần giao diện tự điều chỉnh theo kích thước màn hình.|Không bị vỡ giao diện ở các breakpoint.|
|NFR-MAIN-01|Maintainability|Mã nguồn được tổ chức theo kiến trúc module.|Các module được tách biệt rõ ràng.|
|NFR-MAIN-02|Maintainability|Tuân thủ quy ước đặt tên và cấu trúc mã nguồn thống nhất.|Source code tuân theo coding convention.|
|NFR-RELI-01|Reliability|Hệ thống đảm bảo tính toàn vẹn dữ liệu khi thực hiện CRUD.|Không phát sinh dữ liệu không hợp lệ.|
|NFR-RELI-02|Reliability|Hệ thống xử lý ngoại lệ và trả về thông báo lỗi phù hợp.|API trả đúng HTTP Status và Error Message.|
|NFR-COMP-01|Compatibility|Hệ thống hoạt động trên các trình duyệt phổ biến (Chrome, Edge, Firefox).|Kiểm thử trên các trình duyệt được hỗ trợ.|
|NFR-SCALE-01|Scalability|Kiến trúc cho phép mở rộng thêm module trong tương lai.|Có thể bổ sung module mới mà không ảnh hưởng module hiện có.|

---

## 3. Business Rules tổng quan

> *(Chi tiết business rules cho từng API nằm ở [07_API_Design.md](07_API_Design.md))*

|ID|Business Rule|
|---|---|
|**BR-01**|Mỗi người dùng chỉ được phép truy cập và quản lý dữ liệu thuộc về chính mình.|
|**BR-02**|Mỗi Task phải thuộc đúng một người dùng.|
|**BR-03**|Mỗi Learning phải thuộc đúng một người dùng.|
|**BR-04**|Mỗi Calendar Event phải thuộc đúng một người dùng.|
|**BR-05**|`dueDate` của Task không được nhỏ hơn ngày tạo (`createdAt`).|
|**BR-06**|`dueDate` của Learning không được nhỏ hơn ngày tạo (`createdAt`).|
|**BR-07**|Một Task có thể liên kết với nhiều Reference và một Reference có thể được sử dụng cho nhiều Task.|
|**BR-08**|Một Learning có thể liên kết với nhiều Reference và một Reference có thể được sử dụng cho nhiều Learning.|
|**BR-09**|Khi Task hoặc Learning được đánh dấu hoàn thành thì không được tạo thông báo nhắc hạn mới.|
|**BR-10**|Dashboard chỉ hiển thị dữ liệu thuộc người dùng hiện tại.|
|**BR-11**|Notification chỉ được tạo cho Task hoặc Learning có thời hạn.|
|**BR-12**|Email đăng ký trong hệ thống phải là duy nhất.|
|**BR-13**|Người dùng phải đăng nhập mới được sử dụng các chức năng của hệ thống.|
|**BR-14**|Mỗi Task hoặc Learning phải có tiêu đề (`title`).|
|**BR-15**|Không được xóa người dùng khi vẫn còn dữ liệu liên quan; việc xóa thực hiện theo Soft Delete hoặc bị từ chối theo thiết kế hệ thống.|

---

*Tiếp theo: [03_Functional_Analysis.md](03_Functional_Analysis.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
