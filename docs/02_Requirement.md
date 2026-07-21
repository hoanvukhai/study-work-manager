# 02_Requirement.md — Yêu cầu hệ thống

> **Tầng:** Business (Tầng 1 / 3)  
> **Phụ thuộc vào:** [01_Research.md](01_Research.md) — Pain Points (PP-01..PP-05), Objectives (OBJ-01..OBJ-06), Scope  
> **Tài liệu tiếp theo:** [03_Functional_Analysis.md](03_Functional_Analysis.md)  
> **Trạng thái:** ⬜ Chưa bắt đầu  
> **Cập nhật lần cuối:** —

---

<!-- 
  HƯỚNG DẪN VIẾT FILE NÀY:
  
  Đọc kỹ 01_Research.md trước, đặc biệt là:
  - Mục 5 Pain Points (PP-01..PP-05) → sinh ra Functional Requirements
  - Mục 7 Objectives (OBJ-01..OBJ-06) → sinh ra Functional Requirements  
  - Mục 8 Scope → xác định rõ IN/OUT scope cho từng requirement
  
  Cách đặt ID requirement:
  - FR-AUTH-01, FR-AUTH-02 ...  (Auth module)
  - FR-TASK-01, FR-TASK-02 ...  (Task module)
  - FR-LEARN-01, FR-LEARN-02 ... (Learning module)
  - FR-CAL-01 ...               (Calendar module)
  - FR-REF-01 ...               (Reference module)
  - FR-DASH-01 ...              (Dashboard module)
  - FR-NOTIF-01 ...             (Notification module)
  - NFR-PERF-01 ...             (Non-Functional — Performance)
  - NFR-SEC-01 ...              (Non-Functional — Security)
-->

## 1. Functional Requirements (Yêu cầu chức năng)

### 1.1 Auth — Xác thực & Phiên đăng nhập

| ID | Yêu cầu | Nguồn gốc | Độ ưu tiên |
|---|---|---|---|
| FR-AUTH-01 | ... | OBJ-xx / PP-xx | Must have |
| FR-AUTH-02 | ... | | |

> *Điền vào đây khi viết tài liệu*

---

### 1.2 Task — Quản lý công việc

| ID | Yêu cầu | Nguồn gốc | Độ ưu tiên |
|---|---|---|---|
| FR-TASK-01 | ... | PP-02, OBJ-01 | Must have |

---

### 1.3 Learning — Quản lý nội dung học tập

| ID | Yêu cầu | Nguồn gốc | Độ ưu tiên |
|---|---|---|---|
| FR-LEARN-01 | ... | PP-01, OBJ-02 | Must have |

---

### 1.4 Calendar — Lịch trình cá nhân

| ID | Yêu cầu | Nguồn gốc | Độ ưu tiên |
|---|---|---|---|
| FR-CAL-01 | ... | PP-04, OBJ-03 | Must have |

---

### 1.5 Reference — Tài liệu tham khảo

| ID | Yêu cầu | Nguồn gốc | Độ ưu tiên |
|---|---|---|---|
| FR-REF-01 | ... | PP-03, OBJ-04 | Must have |

---

### 1.6 Dashboard — Tổng quan

| ID | Yêu cầu | Nguồn gốc | Độ ưu tiên |
|---|---|---|---|
| FR-DASH-01 | ... | PP-05, OBJ-05 | Must have |

---

### 1.7 Notification — Nhắc nhở

| ID | Yêu cầu | Nguồn gốc | Độ ưu tiên |
|---|---|---|---|
| FR-NOTIF-01 | ... | PP-01, OBJ-06 | Should have |

---

## 2. Non-Functional Requirements (Yêu cầu phi chức năng)

| ID | Nhóm | Yêu cầu | Tiêu chí kiểm tra |
|---|---|---|---|
| NFR-PERF-01 | Performance | API response < 500ms trong điều kiện bình thường | ... |
| NFR-SEC-01 | Security | Mật khẩu phải được hash (bcrypt) trước khi lưu vào DB | ... |
| NFR-SEC-02 | Security | JWT Access Token hết hạn sau 15 phút | ... |
| NFR-MAINT-01 | Maintainability | ... | ... |
| NFR-RESP-01 | Responsive | Giao diện hoạt động trên màn hình từ 375px trở lên | ... |

---

## 3. Business Rules tổng quan

> *(Chi tiết business rules cho từng API nằm ở [07_API_Design.md](07_API_Design.md))*

- BR-01: Mỗi Task/Learning phải thuộc về đúng 1 người dùng — không thể xem task của người khác.
- BR-02: `dueDate` của Task/Learning không được nhỏ hơn ngày tạo.
- BR-03: ...

---

*Tài liệu tiếp theo trong chuỗi: [03_Functional_Analysis.md](03_Functional_Analysis.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
