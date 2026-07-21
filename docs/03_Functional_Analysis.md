# 03_Functional_Analysis.md — Phân tích chức năng

> **Tầng:** Business (Tầng 1 / 3)  
> **Phụ thuộc vào:** [02_Requirement.md](02_Requirement.md) — Functional Requirements (FR-*)  
> **Tài liệu tiếp theo:** [04_System_Architecture.md](04_System_Architecture.md) và [05_Domain_Model.md](05_Domain_Model.md)  
> **Trạng thái:** ⬜ Chưa bắt đầu  
> **Cập nhật lần cuối:** —

---

<!--
  HƯỚNG DẪN VIẾT FILE NÀY:
  
  Đây là bước chuyển Requirement sang Use Case & User Story.
  Mỗi User Story phải liên kết ngược lại FR tương ứng trong 02_Requirement.md.
  
  Use Case Diagram (.drawio) lưu tại: ../diagrams/03_UseCase.drawio
  Activity Diagram (.drawio) lưu tại: ../diagrams/04_Activity.drawio
-->

## 1. User Stories

> Cú pháp: "Là [vai trò], tôi muốn [hành động] để [mục đích]."

| # | User Story | FR liên quan | Module |
|---|---|---|---|
| US-01 | Là người dùng, tôi muốn đăng ký tài khoản bằng email và mật khẩu để sử dụng ứng dụng. | FR-AUTH-01 | Auth |
| US-02 | Là người dùng, tôi muốn đăng nhập vào hệ thống để truy cập dữ liệu cá nhân. | FR-AUTH-02 | Auth |
| US-03 | ... | | |

---

## 2. Use Case Diagram

*(Nhúng ảnh export từ draw.io sau khi vẽ xong)*

```
Sơ đồ: ../diagrams/03_UseCase.drawio
Export: ../diagrams/exports/usecase-overview.png
```

<!-- ![Use Case Diagram](../diagrams/exports/usecase-overview.png) -->
<!-- Bỏ comment dòng trên khi đã export ảnh -->

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

## 4. Feature Matrix

> Bảng chéo kiểm tra: Module nào có chức năng gì — đảm bảo không bỏ sót khi code.

| Chức năng | Auth | Task | Learning | Calendar | Reference | Dashboard | Notification |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Tạo mới | — | ✅ | ✅ | ✅ | ✅ | — | — |
| Xem danh sách | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Xem chi tiết | — | ✅ | ✅ | ✅ | ✅ | — | — |
| Cập nhật | — | ✅ | ✅ | ✅ | ✅ | — | — |
| Xóa | — | ✅ | ✅ | ✅ | ✅ | — | — |
| Gắn tag | — | ✅ | ✅ | — | ✅ | — | — |
| Gắn với Task/Learning | — | — | — | ✅ | ✅ | — | — |
| Nhắc nhở deadline | — | ✅ | ✅ | — | — | — | ✅ |

> *(Điền đầy đủ khi hoàn thành 02_Requirement.md)*

---

*Tài liệu tiếp theo trong chuỗi: [04_System_Architecture.md](04_System_Architecture.md) (song song với [05_Domain_Model.md](05_Domain_Model.md))*  
*Quay lại mục lục: [docs/README.md](README.md)*
