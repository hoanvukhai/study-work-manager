# Diagrams — Sơ đồ kỹ thuật hệ thống

Thư mục này chứa toàn bộ các sơ đồ phân tích và thiết kế kỹ thuật được vẽ bằng **draw.io** (`.drawio`).  
Tất cả file ảnh PNG xuất từ sơ đồ để nhúng vào tài liệu được lưu tại thư mục con **`exports/`**.

---

## Danh sách Sơ đồ hệ thống (.drawio & PNG)

### 1. Sơ đồ Phân tích Chức năng (Tài liệu 03)
| File .drawio | File ảnh xuất (exports/) | Mô tả nội dung |
| --- | --- | --- |
| `03_UseCase_00_Overview.drawio` | `03_UseCase_00_Overview.png` | Sơ đồ Use Case tổng quan toàn hệ thống |
| `03_UseCase_01_Auth.drawio.drawio` | `03_UseCase_01_Auth.drawio.png` | Use Case phân hệ Xác thực (Đăng ký, Đăng nhập) |
| `03_UseCase_02_Account.drawio` | `03_UseCase_02_Account.png` | Use Case Quản lý hồ sơ cá nhân |
| `03_UseCase_03_Space.drawio` | `03_UseCase_03_Space.png` | Use Case Quản lý Không gian làm việc |
| `03_UseCase_04_Task.drawio` | `03_UseCase_04_Task.png` | Use Case Quản lý Công việc & Trạng thái |
| `03_UseCase_05_Object_Lifecycle.drawio` | `03_UseCase_05_Object_Lifecycle.png` | Use Case Vòng đời Hạt nhân Đa hình Object |
| `03_UseCase_06_Placement.drawio` | `03_UseCase_06_Placement.png` | Use Case Gắn đối tượng vào nhiều Không gian |
| `03_UseCase_07_Relation.drawio` | `03_UseCase_07_Relation.png` | Use Case Liên kết tri thức chéo hai chiều |
| `03_UseCase_08_View_Dashboard_Notif.drawio` | `03_UseCase_08_View_Dashboard_Notif..png` | Use Case Xem dữ liệu, Dashboard và Thông báo |
| `03_Activity_01_Register.drawio` | `03_Activity_01_Register.png` | Sơ đồ Hoạt động luồng Đăng ký tài khoản |
| `03_Activity_02_Login.drawio` | `03_Activity_02_Login.png` | Sơ đồ Hoạt động luồng Đăng nhập và cấp phát JWT |
| `03_Activity_03_Object_Lifecycle.drawio` | `03_Activity_03_Object_Lifecycle.png` | Sơ đồ Hoạt động Vòng đời Object (Tạo, Sửa, Thùng rác, Xóa vĩnh viễn) |
| `03_Activity_04_Create_Task.drawio` | `03_Activity_04_Create_Task.png` | Sơ đồ Hoạt động luồng Tạo công việc và gán Không gian |
| `03_Activity_05_Remove_Delete.drawio` | `03_Activity_05_Remove_Delete.png` | Sơ đồ Hoạt động Phân biệt "Gỡ khỏi Không gian" vs "Xóa vào Thùng rác" |
| `03_Activity_06_Notification.drawio` | `03_Activity_06_Notification.png` | Sơ đồ Hoạt động Quét và cảnh báo hạn chót công việc |

### 2. Sơ đồ Kiến trúc hệ thống (Tài liệu 04)
| File .drawio | File ảnh xuất (exports/) | Mô tả nội dung |
| --- | --- | --- |
| `04_Context_Diagram.drawio` | `04_Context_Diagram.png` | Sơ đồ Ngữ cảnh hệ thống (System Context Diagram) |
| `04_System_Architecture.drawio` | `04_System_Architecture.png` | Sơ đồ Kiến trúc phân tầng hệ thống (Browser ↔ Next.js ↔ NestJS ↔ PostgreSQL) |

### 3. Sơ đồ Mô hình Nghiệp vụ (Tài liệu 05)
| File .drawio | File ảnh xuất (exports/) | Mô tả nội dung |
| --- | --- | --- |
| `05_Domain_Model.drawio` | `05_Domain_Model.png` | Sơ đồ Thực thể nghiệp vụ độc lập (Domain Model) |

### 4. Sơ đồ Cơ sở dữ liệu (Tài liệu 06)
| File .drawio | File ảnh xuất (exports/) | Mô tả nội dung |
| --- | --- | --- |
| `06_ERD (1).drawio` | `06_ERD.png` | Sơ đồ Thực thể Liên kết (ERD Logic) chuẩn hóa 8 bảng |

---

## Quy định về thư mục `exports/`

- Thư mục **`diagrams/exports/`** chỉ chứa các sơ đồ kỹ thuật phân tích & thiết kế (Use Case, Activity, Architecture, Domain Model, ERD).
- Toàn bộ ảnh thiết kế giao diện UI/UX (Wireframe, Mockup, Mobile View) được đặt tại **`design/exports/`**.

---

*Chi tiết tài liệu hệ thống: [docs/README.md](../docs/README.md)*
