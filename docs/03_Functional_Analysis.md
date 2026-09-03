# 03_Functional_Analysis.md — Phân tích chức năng

> Tài liệu trước: [02_Requirement.md](02_Requirement.md)  
> Tài liệu sau: [04_System_Architecture.md](04_System_Architecture.md) và [05_Domain_Model.md](05_Domain_Model.md)  
> Trạng thái: Chưa hoàn thành

---
## 1. User Stories

## Auth

|ID|User Story|FR liên quan|Module|
|---|---|---|---|
|US-01|Là người dùng, tôi muốn đăng ký tài khoản bằng email và mật khẩu để sử dụng ứng dụng.|FR-AUTH-01|Auth|
|US-02|Là người dùng, tôi muốn đăng nhập bằng tài khoản đã đăng ký để truy cập dữ liệu cá nhân.|FR-AUTH-02|Auth|
|US-03|Là người dùng, tôi muốn đăng xuất khỏi hệ thống để đảm bảo an toàn cho tài khoản.|FR-AUTH-04|Auth|
|US-04|Là người dùng, tôi muốn cập nhật thông tin cá nhân để thông tin tài khoản luôn chính xác.|FR-AUTH-05|Auth|
|US-05|Là người dùng, tôi muốn thay đổi mật khẩu khi cần để tăng tính bảo mật.|FR-AUTH-06|Auth|
|US-06|Là người dùng, tôi muốn khôi phục mật khẩu qua email khi quên mật khẩu để có thể tiếp tục sử dụng hệ thống.|FR-AUTH-09|Auth|

---
## Task

| ID    | User Story                                                                                               | FR liên quan           | Module |
| ----- | -------------------------------------------------------------------------------------------------------- | ---------------------- | ------ |
| US-07 | Là người dùng, tôi muốn tạo công việc mới để theo dõi những việc cần thực hiện.                          | FR-TASK-01             | Task   |
| US-08 | Là người dùng, tôi muốn chỉnh sửa thông tin công việc để cập nhật khi có thay đổi.                       | FR-TASK-03             | Task   |
| US-09 | Là người dùng, tôi muốn xóa công việc không còn cần thiết để danh sách luôn gọn gàng.                    | FR-TASK-04             | Task   |
| US-10 | Là người dùng, tôi muốn đánh dấu công việc đã hoàn thành để theo dõi tiến độ.                            | FR-TASK-05             | Task   |
| US-11 | Là người dùng, tôi muốn đặt deadline và mức độ ưu tiên cho công việc để sắp xếp thứ tự xử lý.            | FR-TASK-06, FR-TASK-07 | Task   |
| US-12 | Là người dùng, tôi muốn tìm kiếm và lọc công việc để nhanh chóng tìm được nội dung cần thiết.            | FR-TASK-08, FR-TASK-09 | Task   |
| US-13 | Là người dùng, tôi muốn tổ chức công việc theo bảng Kanban để quản lý trực quan hơn.                     | FR-TASK-11             | Task   |
| US-14 | Là người dùng, tôi muốn chia một công việc lớn thành nhiều công việc nhỏ để dễ theo dõi tiến độ.         | FR-TASK-13             | Task   |
| US-15 | Là người dùng, tôi muốn gắn nhãn (Tag) cho công việc để dễ phân loại và tìm kiếm.                        | FR-TASK-12             | Task   |
| US-16 | Là người dùng, tôi muốn đính kèm ghi chú (Note) vào công việc để có thể truy cập nhanh khi làm việc. | FR-TASK-13             | Task   |

---

## Learning

|ID|User Story|FR liên quan|Module|
|---|---|---|---|
|US-17|Là người dùng, tôi muốn tạo một chủ đề hoặc khóa học để quản lý quá trình học tập.|FR-LEARN-01|Learning|
|US-18|Là người dùng, tôi muốn thêm các bài học hoặc nội dung học tập vào từng chủ đề để xây dựng lộ trình học.|FR-LEARN-02|Learning|
|US-19|Là người dùng, tôi muốn cập nhật tiến độ học tập để biết mình đã hoàn thành đến đâu.|FR-LEARN-05|Learning|
|US-20|Là người dùng, tôi muốn đặt mục tiêu và deadline cho nội dung học tập để duy trì kế hoạch học.|FR-LEARN-06|Learning|
|US-21|Là người dùng, tôi muốn tìm kiếm và lọc các nội dung học tập để nhanh chóng truy cập khi cần.|FR-LEARN-09|Learning|
|US-22|Là người dùng, tôi muốn đính kèm ghi chú (Note) với từng nội dung học tập để thuận tiện cho việc ôn tập.|FR-LEARN-08|Learning|

---

## Calendar

|ID|User Story|FR liên quan|Module|
|---|---|---|---|
|US-23|Là người dùng, tôi muốn xem lịch theo ngày hoặc tháng để theo dõi kế hoạch của mình.|FR-CAL-01|Calendar|
|US-24|Là người dùng, tôi muốn tạo sự kiện cá nhân trên lịch để quản lý thời gian hiệu quả hơn.|FR-CAL-02|Calendar|
|US-25|Là người dùng, tôi muốn liên kết công việc hoặc nội dung học tập với lịch để theo dõi tập trung.|FR-CAL-05, FR-CAL-06|Calendar|
|US-26|Là người dùng, tôi muốn chỉnh sửa hoặc xóa sự kiện khi kế hoạch thay đổi.|FR-CAL-03, FR-CAL-04|Calendar|

---

## Note

|ID|User Story|FR liên quan|Module|
|---|---|---|---|
|US-27|Là người dùng, tôi muốn tạo ghi chú (Note) để lưu trữ văn bản hoặc thẻ Bookmark (URL) sử dụng về sau.|FR-NOTE-01, FR-NOTE-04|Note|
|US-28|Là người dùng, tôi muốn đính kèm ghi chú vào công việc hoặc nội dung học tập để dễ tra cứu.|FR-NOTE-05, FR-NOTE-06|Note|
|US-29|Là người dùng, tôi muốn tìm kiếm và phân loại ghi chú bằng Tag để truy cập nhanh hơn.|FR-NOTE-07, FR-NOTE-08|Note|

---

## Dashboard

|ID|User Story|FR liên quan|Module|
|---|---|---|---|
|US-30|Là người dùng, tôi muốn xem tổng quan các công việc, lịch trình và nội dung học tập trên một màn hình để nắm bắt nhanh tình hình trong ngày.|FR-DASH-01|Dashboard|
|US-31|Là người dùng, tôi muốn xem các công việc và nội dung học tập sắp đến hạn để ưu tiên xử lý.|FR-DASH-02|Dashboard|
|US-32|Là người dùng, tôi muốn xem thống kê tiến độ học tập và công việc để đánh giá quá trình thực hiện mục tiêu.|FR-DASH-04|Dashboard|
|US-33|Là người dùng, tôi muốn truy cập nhanh đến Task, Learning hoặc Calendar từ Dashboard để thao tác thuận tiện hơn.|FR-DASH-05|Dashboard|

---

## Notification

|ID|User Story|FR liên quan|Module|
|---|---|---|---|
|US-34|Là người dùng, tôi muốn nhận thông báo khi công việc hoặc nội dung học tập sắp đến hạn để tránh bỏ sót deadline.|FR-NOTIF-01|Notification|
|US-35|Là người dùng, tôi muốn xem danh sách các thông báo chưa đọc để không bỏ lỡ thông tin quan trọng.|FR-NOTIF-02|Notification|
|US-36|Là người dùng, tôi muốn đánh dấu thông báo đã đọc sau khi xem để dễ quản lý.|FR-NOTIF-03|Notification|
|US-37|Là người dùng, tôi muốn nhận thông báo khi có sự kiện trên lịch sắp diễn ra để chủ động sắp xếp thời gian.|FR-NOTIF-04|Notification|

---

## 2. Use Case Diagram (Sơ đồ Use Case)

*(Nhúng ảnh export từ draw.io sau khi vẽ xong)*

```
Sơ đồ: ../diagrams/03_UseCase.drawio
Export: ../diagrams/exports/usecase-overview.png
```

<!-- ![Use Case Diagram](../diagrams/exports/usecase-overview.png) -->

---

## 3. Chi tiết Use Case

<!-- 
  Dùng template dưới đây cho mỗi use case quan trọng.
  Không cần viết chi tiết tất cả — chỉ những UC phức tạp hoặc có nhiều business rule.
-->

### UC-01: Đăng ký tài khoản

| | |
|---|---|
| **Actor** | Khách (chưa đăng nhập) |
| **Precondition** | Người dùng chưa có tài khoản |
| **Trigger** | Người dùng nhấn nút "Đăng ký" |
| **Main Flow** | 1. Người dùng nhập email và mật khẩu <br> 2. Hệ thống kiểm tra email chưa tồn tại <br> 3. Hệ thống tạo tài khoản, hash mật khẩu <br> 4. Hệ thống trả về thành công, chuyển trang đăng nhập |
| **Alternative Flow** | 2a. Email đã tồn tại → trả về lỗi "Email đã được đăng ký" |
| **Postcondition** | Tài khoản được tạo trong database |
| **FR liên quan** | FR-AUTH-01 |

### UC-02: ...

*(Thêm vào đây)*


---

## 4. Activity Diagram (Sơ đồ Hoạt động)

> Sơ đồ hoạt động biểu diễn luồng thực thi chi tiết của các chức năng/luồng nghiệp vụ phức tạp trong hệ thống.

*(Nhúng ảnh export từ draw.io sau khi vẽ xong)*

```
Sơ đồ: ../diagrams/04_Activity.drawio
Export: ../diagrams/exports/activity-overview.png
```

<!-- ![Activity Diagram](../diagrams/exports/activity-overview.png) -->

---

## 5. Feature Matrix (Ma trận Chức năng)

> Bảng chéo kiểm tra: Module nào có chức năng gì — đảm bảo không bỏ sót khi code.

| Chức năng | Auth | Task | Learning | Calendar | Note | Dashboard | Notification |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Tạo mới | — | ✅ | ✅ | ✅ | ✅ | — | — |
| Xem danh sách | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Xem chi tiết | — | ✅ | ✅ | ✅ | ✅ | — | — |
| Cập nhật | — | ✅ | ✅ | ✅ | ✅ | — | — |
| Xóa | — | ✅ | ✅ | ✅ | ✅ | — | — |
| Gắn tag | — | ✅ | ✅ | — | ✅ | — | — |
| Gắn với Task/Learning | — | — | — | ✅ | ✅ | — | — |
| Nhắc nhở deadline | — | ✅ | ✅ | — | — | — | ✅ |

---

*Tiếp theo: [04_System_Architecture.md](04_System_Architecture.md) (song song với [05_Domain_Model.md](05_Domain_Model.md))*  
*Quay lại mục lục: [docs/README.md](README.md)*
