# 12_Report_Notes.md — Ghi chú cho báo cáo

> **Tầng:** Development (Tầng 3 / 3)  
> **Phụ thuộc vào:** Toàn bộ tài liệu trước (01–11)  
> **Tài liệu tiếp theo:** *(Cuối chuỗi — bước tiếp là viết báo cáo tốt nghiệp trong `report/drafts/`)*  
> **Trạng thái:** ⬜ Chưa bắt đầu  
> **Cập nhật lần cuối:** —

---

<!--
  File này là "hộp tổng hợp" — ghi lại mọi thứ cần dùng khi viết báo cáo.
  Ghi bất cứ khi nào bạn có số liệu, kết quả, hình ảnh đáng chú ý.
  Không cần viết theo thứ tự — viết khi nhớ ra.
-->

## 1. Số liệu quan trọng

*(Điền trong và sau quá trình phát triển)*

| Chỉ số | Giá trị | Nguồn |
|---|---|---|
| Tổng số Functional Requirements | — | 02_Requirement.md |
| Tổng số User Stories | — | 03_Functional_Analysis.md |
| Tổng số Use Cases | — | 03_Functional_Analysis.md |
| Tổng số API Endpoints | — | 07_API_Design.md |
| Tổng số bảng database | — | 06_Database_Design.md |
| Số test cases | — | 10_Testing.md |
| Test pass rate | — | 10_Testing.md |

---

## 2. Hình ảnh cần chụp cho báo cáo

*(Chụp screenshot sau khi hoàn thành từng phần, lưu vào `../report/images/`)*

**Chương 3 — Phân tích & Thiết kế:**
- [ ] Architecture diagram (export từ `02_Architecture.drawio`)
- [ ] Use Case diagram (export từ `03_UseCase.drawio`)
- [ ] ERD Logic (export từ `06_ERD.drawio`)
- [ ] Screenshot Figma prototype (Dashboard, Tasks, Calendar)

**Chương 4 — Xây dựng & Triển khai:**
- [ ] Screenshot màn hình Dashboard
- [ ] Screenshot màn hình Tasks
- [ ] Screenshot màn hình Learning
- [ ] Screenshot màn hình Calendar
- [ ] Screenshot màn hình References
- [ ] Screenshot màn hình đăng nhập/đăng ký
- [ ] Kết quả chạy test (Jest output)

---

## 3. Kết quả đáng ghi nhận

*(Ghi lại trong quá trình làm — sẽ dùng ở Chương 5 Kết luận)*

- ...
- ...

---

## 4. Ánh xạ tài liệu → Chương báo cáo

| Tài liệu | Tương ứng chương báo cáo |
|---|---|
| 01_Research.md | Chương 1: Tổng quan + Chương 2: Phần đầu |
| 02_Requirement.md | Chương 2: Phân tích yêu cầu |
| 03_Functional_Analysis.md | Chương 2: User Story, Use Case |
| 04_System_Architecture.md | Chương 3: Kiến trúc hệ thống |
| 05_Domain_Model.md | Chương 3: Phân tích domain |
| 06_Database_Design.md | Chương 3: Thiết kế CSDL |
| 07_API_Design.md | Chương 3: Thiết kế API |
| 08_UI_UX_Design.md | Chương 3: Thiết kế giao diện |
| 09_Implementation.md | Chương 4: Xây dựng |
| 10_Testing.md | Chương 4: Kiểm thử |
| 11_Deployment.md | Chương 4: Triển khai |

---

## 5. Hướng phát triển (cho Chương 5 — Kết luận)

*(Ghi lại những tính năng muốn làm nhưng nằm ngoài phạm vi đồ án)*

- Cộng tác thời gian thực (WebSocket)
- Tích hợp Google Calendar API
- Ứng dụng mobile (React Native)
- Thống kê/biểu đồ tiến độ học tập
- Nhắc nhở qua email

---

*Quay lại mục lục: [docs/README.md](README.md)*
