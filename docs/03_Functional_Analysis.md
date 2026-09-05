# 03_Functional_Analysis.md — Phân tích chức năng

> Tài liệu trước: [02_Requirement.md](02_Requirement.md)
> Tài liệu sau: [04_System_Architecture.md](04_System_Architecture.md) và [05_Domain_Model.md](05_Domain_Model.md)
> Trạng thái: Chưa hoàn thành

---

## 1. User Stories

### Auth

| ID    | User Story                                                                                                     | FR liên quan | Module |
| ----- | -------------------------------------------------------------------------------------------------------------- | ------------ | ------ |
| US-01 | Là người dùng, tôi muốn đăng ký tài khoản bằng email và mật khẩu để sử dụng ứng dụng.                        | FR-AUTH-01   | Auth   |
| US-02 | Là người dùng, tôi muốn đăng nhập bằng tài khoản đã đăng ký để truy cập dữ liệu cá nhân.                    | FR-AUTH-02   | Auth   |
| US-03 | Là người dùng, tôi muốn đăng xuất khỏi hệ thống để đảm bảo an toàn cho tài khoản.                           | FR-AUTH-04   | Auth   |
| US-04 | Là người dùng, tôi muốn cập nhật thông tin cá nhân để thông tin tài khoản luôn chính xác.                    | FR-AUTH-06   | Auth   |
| US-05 | Là người dùng, tôi muốn thay đổi mật khẩu khi cần để tăng tính bảo mật.                                     | FR-AUTH-07   | Auth   |

---

### Space

| ID    | User Story                                                                                                                                      | FR liên quan | Module |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------ |
| US-06 | Là người dùng, tôi muốn tạo một Space theo chủ đề riêng để quản lý mọi thứ liên quan trong đó mà không phải phân vân nó thuộc "Học" hay "Việc". | FR-SPACE-01  | Space  |
| US-07 | Là người dùng, tôi muốn xem danh sách các Space của mình để nhanh chóng chọn không gian cần làm việc.                                           | FR-SPACE-02  | Space  |
| US-08 | Là người dùng, tôi muốn đổi tên hoặc sắp xếp thứ tự ưu tiên.                                                                                    | FR-SPACE-04  | Space  |
| US-09 | Là người dùng, tôi muốn xoá một Space khi không còn cần đến để giữ danh sách gọn gàng.                                                          | FR-SPACE-05  | Space  |

---

### Task

| ID    | User Story                                                                                                     | FR liên quan              | Module |
| ----- | -------------------------------------------------------------------------------------------------------------- | ------------------------- | ------ |
| US-10 | Là người dùng, tôi muốn tạo công việc mới trong một Space để theo dõi những gì cần thực hiện.                | FR-TASK-01                | Task   |
| US-11 | Là người dùng, tôi muốn chỉnh sửa thông tin công việc để cập nhật khi có thay đổi.                          | FR-TASK-04                | Task   |
| US-12 | Là người dùng, tôi muốn xoá công việc không còn cần thiết để danh sách luôn gọn gàng.                       | FR-TASK-05                | Task   |
| US-13 | Là người dùng, tôi muốn đánh dấu công việc đã hoàn thành để theo dõi tiến độ.                               | FR-TASK-06                | Task   |
| US-14 | Là người dùng, tôi muốn đặt deadline và mức độ ưu tiên cho công việc để sắp xếp thứ tự xử lý.               | FR-TASK-01                | Task   |
| US-15 | Là người dùng, tôi muốn tìm kiếm và lọc công việc để nhanh chóng tìm được nội dung cần thiết.               | FR-TASK-09                | Task   |
| US-16 | Là người dùng, tôi muốn gắn Tag cho công việc để dễ phân loại và tìm kiếm.                                  | FR-TASK-10                | Task   |

---

### Note

| ID    | User Story                                                                                              | FR liên quan | Module |
| ----- | ------------------------------------------------------------------------------------------------------- | ------------ | ------ |
| US-17 | Là người dùng, tôi muốn tạo ghi chú trong một Space để lưu lại suy nghĩ, tóm tắt bài học hoặc kế hoạch. | FR-NOTE-01   | Note   |
| US-18 | Là người dùng, tôi muốn chỉnh sửa nội dung ghi chú để cập nhật khi có thông tin mới.                    | FR-NOTE-04   | Note   |
| US-19 | Là người dùng, tôi muốn xoá ghi chú không còn cần thiết.                                                | FR-NOTE-05   | Note   |
| US-20 | Là người dùng, tôi muốn tìm kiếm ghi chú theo tiêu đề để truy cập nhanh khi cần.                        | FR-NOTE-08   | Note   |

---

### Event

| ID    | User Story                                                                                                     | FR liên quan              | Module |
| ----- | -------------------------------------------------------------------------------------------------------------- | ------------------------- | ------ |
| US-21 | Là người dùng, tôi muốn tạo sự kiện trong một Space để ghi lại các buổi họp, lịch học hoặc deadline quan trọng. | FR-EVENT-01            | Event  |
| US-22 | Là người dùng, tôi muốn chỉnh sửa hoặc xoá sự kiện khi kế hoạch thay đổi.                                   | FR-EVENT-03, FR-EVENT-04  | Event  |

---

### Reference

| ID    | User Story                                                                                                     | FR liên quan | Module    |
| ----- | -------------------------------------------------------------------------------------------------------------- | ------------ | --------- |
| US-23 | Là người dùng, tôi muốn lưu link tài liệu tham khảo vào một Space để không phải tìm lại mỗi lần cần.        | FR-REF-01    | Reference |
| US-24 | Là người dùng, tôi muốn gắn Tag cho tài liệu tham khảo để phân loại và tìm nhanh hơn.                       | FR-REF-06    | Reference |

---

### Relation

| ID    | User Story                                                                                                     | FR liên quan | Module   |
| ----- | -------------------------------------------------------------------------------------------------------------- | ------------ | -------- |
| US-25 | Là người dùng, tôi muốn liên kết ghi chú với công việc để biết tài liệu nào phục vụ cho việc nào.           | FR-REL-01    | Relation |
| US-26 | Là người dùng, tôi muốn liên kết tài liệu tham khảo với sự kiện để chuẩn bị sẵn trước buổi họp.            | FR-REL-01    | Relation |
| US-27 | Là người dùng, tôi muốn xem tất cả nội dung đang liên kết với một công việc cụ thể để nắm được toàn bộ context. | FR-REL-02 | Relation |

---

### View

| ID    | User Story                                                                                                     | FR liên quan | Module |
| ----- | -------------------------------------------------------------------------------------------------------------- | ------------ | ------ |
| US-28 | Là người dùng, tôi muốn xem lịch theo ngày/tuần/tháng để theo dõi deadline và sự kiện sắp đến.              | FR-VIEW-01   | View   |
| US-29 | Là người dùng, tôi muốn xem toàn bộ nội dung trong một Space dạng danh sách để có cái nhìn tổng thể.        | FR-VIEW-02   | View   |
| US-30 | Là người dùng, tôi muốn xem công việc theo bảng Kanban để quản lý tiến độ trực quan hơn.                    | FR-VIEW-03   | View   |

---

### Dashboard

| ID    | User Story                                                                                                     | FR liên quan | Module    |
| ----- | -------------------------------------------------------------------------------------------------------------- | ------------ | --------- |
| US-31 | Là người dùng, tôi muốn xem ngay trên Dashboard những công việc và sự kiện sắp đến hạn để biết mình cần ưu tiên cái gì. | FR-DASH-01 | Dashboard |
| US-32 | Là người dùng, tôi muốn xem thống kê tổng quan công việc theo trạng thái để đánh giá nhanh tiến độ.         | FR-DASH-02   | Dashboard |
| US-33 | Là người dùng, tôi muốn truy cập nhanh vào Space hoặc công việc từ Dashboard để thao tác thuận tiện.         | FR-DASH-04   | Dashboard |

---

### Notification

| ID    | User Story                                                                                                     | FR liên quan  | Module       |
| ----- | -------------------------------------------------------------------------------------------------------------- | ------------- | ------------ |
| US-34 | Là người dùng, tôi muốn nhận thông báo khi công việc hoặc sự kiện sắp đến hạn để không bỏ lỡ.               | FR-NOTIF-01   | Notification |
| US-35 | Là người dùng, tôi muốn xem danh sách các thông báo chưa đọc để không bỏ lỡ thông tin quan trọng.           | FR-NOTIF-02   | Notification |
| US-36 | Là người dùng, tôi muốn đánh dấu thông báo đã đọc sau khi xem để dễ quản lý.                                | FR-NOTIF-04   | Notification |

---

## 2. Use Case Diagram (Sơ đồ Use Case)

*(Nhúng ảnh export từ draw.io sau khi vẽ xong)*

```
Sơ đồ: ../diagrams/UseCase.drawio
Export: ../diagrams/exports/usecase-overview.png
```

<!-- ![Use Case Diagram](../diagrams/exports/usecase-overview.png) -->

---

## 3. Chi tiết Use Case

<!--
  Dùng template dưới đây cho mỗi Use Case quan trọng.
  Không cần viết chi tiết tất cả — chỉ những UC phức tạp hoặc có nhiều Business Rule.
-->

### UC-01: Đăng ký tài khoản

| | |
|---|---|
| **Actor** | Khách (chưa đăng nhập) |
| **Precondition** | Người dùng chưa có tài khoản |
| **Trigger** | Người dùng nhấn nút "Đăng ký" |
| **Main Flow** | 1. Người dùng nhập họ tên, email và mật khẩu <br> 2. Hệ thống kiểm tra email chưa tồn tại <br> 3. Hệ thống tạo tài khoản, hash mật khẩu <br> 4. Hệ thống trả về thành công, chuyển trang đăng nhập |
| **Alternative Flow** | 2a. Email đã tồn tại → trả về lỗi "Email đã được đăng ký" |
| **Postcondition** | Tài khoản được tạo trong database |
| **FR liên quan** | FR-AUTH-01 |

### UC-02: Tạo Space

|                      |                                                                                                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Actor**            | Người dùng đã đăng nhập                                                                                                                                                                      |
| **Precondition**     | Người dùng đang ở màn hình danh sách Space                                                                                                                                                   |
| **Trigger**          | Người dùng nhấn nút "Tạo Space mới"                                                                                                                                                          |
| **Main Flow**        | 1. Người dùng nhập tên Space <br> 2. Hệ thống kiểm tra tên không để trống <br> 3. Hệ thống tạo Space và gắn với người dùng hiện tại <br> 4. Hệ thống chuyển vào trang chi tiết Space vừa tạo |
| **Alternative Flow** | 2a. Tên để trống → trả về lỗi "Tên Space không được để trống"                                                                                                                                |
| **Postcondition**    | Space được tạo trong database và hiển thị trong danh sách Space của người dùng                                                                                                               |
| **FR liên quan**     | FR-SPACE-01                                                                                                                                                                                  |

### UC-03: ...

*(Thêm vào đây)*

---

## 4. Activity Diagram (Sơ đồ Hoạt động)

> Sơ đồ hoạt động biểu diễn luồng thực thi chi tiết của các chức năng và luồng nghiệp vụ phức tạp trong hệ thống.

*(Nhúng ảnh export từ draw.io sau khi vẽ xong)*

```
Sơ đồ: ../diagrams/Activity.drawio
Export: ../diagrams/exports/activity-overview.png
```

<!-- ![Activity Diagram](../diagrams/exports/activity-overview.png) -->

---

## 5. Feature Matrix (Ma trận Chức năng)

> Bảng chéo kiểm tra: Module nào có chức năng gì — đảm bảo không bỏ sót khi code.

| Chức năng              | Auth | Space | Task | Note | Event | Reference | Relation | View | Dashboard | Notification |
| ---------------------- |:----:|:-----:|:----:|:----:|:-----:|:---------:|:--------:|:----:|:---------:|:------------:|
| Tạo mới                | ✅   | ✅    | ✅   | ✅   | ✅    | ✅        | ✅       | —    | —         | —            |
| Xem danh sách          | —    | ✅    | ✅   | ✅   | ✅    | ✅        | ✅       | ✅   | ✅        | ✅           |
| Xem chi tiết           | —    | ✅    | ✅   | ✅   | ✅    | ✅        | —        | —    | —         | —            |
| Cập nhật               | ✅   | ✅    | ✅   | ✅   | ✅    | ✅        | —        | —    | —         | —            |
| Xoá                    | —    | ✅    | ✅   | ✅   | ✅    | ✅        | ✅       | —    | —         | ✅           |
| Gắn Tag                | —    | —     | ✅   | ✅   | —     | ✅        | —        | —    | —         | —            |
| Liên kết với nội dung khác | —  | —     | ✅   | ✅   | ✅    | ✅        | ✅       | —    | —         | —            |
| Nhắc nhở deadline      | —    | —     | ✅   | —    | ✅    | —         | —        | —    | ✅        | ✅           |
| Hiển thị theo thời gian | —   | —     | ✅   | —    | ✅    | —         | —        | ✅   | —         | —            |

---

*Tiếp theo: [04_System_Architecture.md](04_System_Architecture.md) (song song với [05_Domain_Model.md](05_Domain_Model.md))*
*Quay lại mục lục: [docs/README.md](README.md)*
