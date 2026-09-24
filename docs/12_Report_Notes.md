# 12_Report_Notes.md — Ghi chú cho báo cáo tốt nghiệp

> **Tầng:** Development (Tầng 3 / 3)  
> **Phụ thuộc vào:** Toàn bộ tài liệu trước (01–11)  
> **Tài liệu tiếp theo:** Báo cáo luận văn tốt nghiệp trong `report/`  
> **Trạng thái:** ⬜ Chưa bắt đầu  
> **Cập nhật lần cuối:** 24/09/2026 (Đồng bộ theo Kiến trúc Lần 3)

---

## 1. Số liệu quan trọng của Đề tài

| Chỉ số | Giá trị | Nguồn tham chiếu |
|---|---|---|
| Tổng số Yêu cầu chức năng (FR) | 11 nhóm (Auth, Space, Task, Note, Event, Ref, Place, Rel, View, Dash, Notif) | `02_Requirement.md` |
| Tổng số Use Cases | 18 Use Cases | `03_Functional_Analysis.md` |
| Tổng số Sơ đồ Hoạt động (Activity) | 6 sơ đồ | `03_Functional_Analysis.md` |
| Tổng số Bảng Cơ sở dữ liệu | 8 bảng chuẩn hóa (PostgreSQL) | `06_Database_Design.md` |
| Tổng số API Endpoints | 22 endpoints RESTful chuẩn | `07_API_Design.md` |

---

## 2. Hình ảnh cần đưa vào Báo cáo (Word / LaTeX)

### Chương 3 — Phân tích & Thiết kế hệ thống:
- [ ] Sơ đồ Biên giới hệ thống: `diagrams/exports/04_Context_Diagram.png`
- [ ] Sơ đồ Kiến trúc phân tầng: `diagrams/exports/04_System_Architecture.png`
- [ ] Sơ đồ Mô hình nghiệp vụ (Domain Model): `diagrams/exports/05_Domain_Model.png`
- [ ] Sơ đồ Cơ sở dữ liệu Logic (ERD 8 bảng): `diagrams/exports/06_ERD.png`
- [ ] Ảnh thiết kế giao diện UI/UX (Figma / Mockups):
  - [ ] Dashboard tổng quan: `diagrams/exports/wireframe-dashboard.png`
  - [ ] Chi tiết Không gian: `diagrams/exports/wireframe-space.png`
  - [ ] Bảng công việc Kanban: `diagrams/exports/wireframe-kanban.png`
  - [ ] Lịch làm việc Calendar: `diagrams/exports/wireframe-calendar.png`
  - [ ] Modal Chi tiết & Liên kết chéo: `diagrams/exports/wireframe-detail-modal.png`
  - [ ] Giao diện Di động: `diagrams/exports/wireframe-mobile.png`

### Chương 4 — Hiện thực hóa & Kết quả:
- [ ] Ảnh chụp màn hình ứng dụng thực tế chạy trên trình duyệt.
- [ ] Kết quả kiểm thử tự động (Jest test suite).

---

## 3. Điểm sáng tạo & Đột phá để thuyết trình trước Hội đồng

1. **Kiến trúc Hạt nhân Đa hình (Hybrid Object Architecture):** Giải phóng người dùng khỏi việc phân loại cứng nhắc "học vs việc"; biến Task, Note, Event, Reference thành các thực thể độc lập có vòng đời riêng.
2. **Cơ chế Gán đa ngữ cảnh (Contextual Placement):** Một công việc có thể hiện diện ở nhiều Không gian khác nhau mà không bị trùng lặp dữ liệu.
3. **Mạng lưới liên kết tri thức (Bi-directional Relations):** Kết nối chéo 2 chiều giữa ghi chú, bài học và nhiệm vụ thực thi (lấy cảm hứng từ Obsidian/Capacities).
4. **Trải nghiệm tối giản (Google Simplicity):** Bảng màu trung tính dịu mắt, giảm thiểu phân tâm, tối ưu cho học tập sâu.

---

*Quay lại mục lục: [docs/README.md](README.md)*
