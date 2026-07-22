# Quy trình làm việc & Quy ước Kỹ thuật (Workflow)

Tài liệu này quy định các quy tắc về quản lý mã nguồn, quy ước đặt tên, quy trình phát triển và các cột mốc của dự án.

---

## 1. Quy tắc Commit (Git Commit Convention)

Cấu trúc commit message:

```text
[scope] Mô tả ngắn gọn bằng tiếng Việt hoặc tiếng Anh

Ví dụ:
[docs] Cập nhật 02_Requirement.md
[feat] Thêm chức năng tạo task mới
[fix] Sửa lỗi validate ngày deadline
[diagram] Thêm sơ đồ ERD mức logic
[report] Viết nháp Chương 2 báo cáo tốt nghiệp
[meeting] Thêm biên bản họp tuần 30
[chore] Khởi tạo cấu trúc dự án
```

Các giá trị scope hợp lệ:
- `docs`: Thêm hoặc cập nhật tài liệu trong thư mục docs/
- `feat`: Thêm tính năng mới (backend hoặc frontend)
- `fix`: Sửa lỗi
- `diagram`: Cập nhật file sơ đồ draw.io hoặc ảnh export
- `report`: Cập nhật nội dung báo cáo tốt nghiệp
- `meeting`: Thêm biên bản họp với GVHD
- `chore`: Cấu hình hệ thống, package, gitignore
- `refactor`: Tái cấu trúc mã nguồn nhưng không đổi tính năng

---

## 2. Quản lý Phiên bản (Git Tags)

Các cột mốc chính của dự án được đánh tag để dễ truy xuất lại lịch sử:

| Tag | Nội dung cột mốc |
|---|---|
| v0.1-docs-business | Hoàn thành Tầng 1 (docs 01, 02, 03) |
| v0.2-docs-design | Hoàn thành Tầng 2 (docs 04, 05, 06, 07, 08) |
| v0.3-backend-core | Backend khởi tạo và hoàn thành các API cốt lõi |
| v0.4-frontend-core | Frontend tích hợp xong giao diện và kết nối API |
| v0.5-testing | Hoàn thành kiểm thử và sửa lỗi |
| v1.0-final | Phiên bản hoàn thiện nộp đồ án tốt nghiệp |

---

## 3. Quy ước Đặt tên (Naming Conventions)

- Tài liệu phân tích thiết kế: `NN_TenTaiLieu.md` (dùng prefix 2 chữ số để sắp xếp thứ tự).
- Sơ đồ draw.io: `NN_TenSoDo.drawio` trong thư mục `diagrams/`.
- File ảnh export: `ten-so-do.png` (dạng kebab-case) trong thư mục `diagrams/exports/` hoặc `report/images/`.
- Biên bản họp: `YYYY-Wxx_chu-de.md` (năm - tuần - chủ đề) trong thư mục `meeting/`.
- Mã nguồn Backend (NestJS): Tuân theo convention chuẩn của NestJS (ví dụ: `task.service.ts`, `create-task.dto.ts`).
- Mã nguồn Frontend (Next.js): Tuân theo App Router convention (`page.tsx`, `layout.tsx`, component dùng PascalCase).

---

## 4. Quy trình Phát triển (Workflow Steps)

Dự án thực hiện theo quy trình 6 bước nối tiếp:

1. **Nghiên cứu & Yêu cầu:** Hoàn thành `01_Research`, `02_Requirement`, `03_Functional_Analysis`.
2. **Thiết kế Hệ thống:** Hoàn thành `04_System_Architecture`, `05_Domain_Model`, `06_Database_Design`, `07_API_Design`, `08_UI_UX_Design`.
3. **Phát triển Mã nguồn:** Khởi tạo `backend/` (NestJS) và `frontend/` (Next.js), tiến hành viết code dựa theo thiết kế.
4. **Kiểm thử & Sửa lỗi:** Thực hiện unit test, integration test và test thủ công, ghi nhận tại `10_Testing.md`.
5. **Triển khai:** Triển khai hệ thống lên môi trường chạy thử/thật, ghi nhận tại `11_Deployment.md`.
6. **Tổng hợp Báo cáo:** Chuyển đổi nội dung từ `docs/` sang các chương báo cáo trong `report/drafts/`.
