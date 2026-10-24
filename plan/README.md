# plan/ — Sổ tay làm việc

> Tạo ngày: 09/10/2026
> Mục đích: ghi lại **hiện trạng, quyết định, lộ trình và việc cần làm** để làm từng phần một. Đây là tài liệu **cho bản thân dùng hằng ngày**, không phải tài liệu nộp hội đồng.

---

## 1. `plan/` khác `docs/` thế nào?

| | `docs/` (01–13) | `plan/` (thư mục này) |
|---|---|---|
| Dành cho ai | Hội đồng, GVHD, báo cáo tốt nghiệp | Chính mình (và Claude) khi làm |
| Mô tả cái gì | Hệ thống **nên là gì** (thiết kế cuối cùng) | Đang ở đâu, còn thiếu gì, làm gì tiếp, sửa gì |
| Yêu cầu | Sạch, nhất quán, không mâu thuẫn | Thực dụng, cập nhật liên tục, được phép lộn xộn |
| Khi nào sửa | Cuối mỗi giai đoạn (khi thiết kế đã ổn định) | Mỗi ngày làm việc |

Một phần của `plan/` sẽ được dùng lại cho báo cáo:
- **Sổ quyết định** → mục "Decision Log" (doc 04) và phần "Lý do thiết kế" trong Chương 3.
- **Nhật ký** → mục "Khó khăn & cách giải quyết" trong Chương 4.
- **Kho ý tưởng** → mục "Hướng phát triển" trong Chương 5.

---

## 2. Các file

| File | Nội dung |
|---|---|
| [01_Hien_Trang.md](01_Hien_Trang.md) | Đánh giá hiện trạng: tính năng nào đã có/thiếu, danh sách lỗi và vấn đề (có mã) |
| [02_Quyet_Dinh.md](02_Quyet_Dinh.md) | Sổ quyết định thiết kế: đã chốt / đang chờ chốt, kèm lý do |
| [03_Lo_Trinh.md](03_Lo_Trinh.md) | Lộ trình theo giai đoạn, checklist việc cần làm, cách kiểm thử, điều kiện "xong" |
| [04_Kho_Y_Tuong.md](04_Kho_Y_Tuong.md) | Kho ý tưởng mở rộng (giải thích đơn giản, độ khó, ô để tự đánh giá) |
| [05_Nhat_Ky.md](05_Nhat_Ky.md) | Nhật ký làm việc: hôm nay làm gì, gặp vấn đề gì, xử lý thế nào |

---

## 3. Ký hiệu dùng chung

- Trạng thái việc: `[ ]` chưa làm · `[x]` xong · thêm chữ **(đang làm)** nếu đang dở.
- Mức độ vấn đề: 🔴 Cao (phải sửa sớm) · 🟡 Trung bình · ⚪ Thấp.
- Mã vấn đề (trong `01_Hien_Trang.md`):
  - `BUG-xx` lỗi chức năng · `SEC-xx` bảo mật · `UI-xx` giao diện/trải nghiệm
  - `TECH-xx` kỹ thuật/hạ tầng · `DOC-xx` tài liệu mâu thuẫn/sai
- Mã quyết định: `QD-xx` (trong `02_Quyet_Dinh.md`).
- Mã ý tưởng: `KH-` Kế hoạch · `HT-` Học tập · `TT-` Tri thức · `AI-` · `NH-` Nhóm · `TB-` Thông báo · `KC-` Khác.
- Cỡ việc: **S** ≈ 1–2 ngày · **M** ≈ 3–5 ngày · **L** ≈ 1–2 tuần (làm một mình).

---

## 4. Quy trình cho mỗi việc

1. Chọn việc tiếp theo trong `03_Lo_Trinh.md` (làm theo thứ tự giai đoạn).
2. Nếu việc liên quan tới một quyết định còn "Chờ chốt" → chốt trước trong `02_Quyet_Dinh.md`.
3. Code.
4. Kiểm thử (xem mục 5) — chưa test thì chưa tính là xong.
5. Tick `[x]`, ghi 1–2 dòng vào `05_Nhat_Ky.md`.
6. Commit theo quy ước trong [docs/Workflow.md](../docs/Workflow.md) (ví dụ `[feat] ...`, `[fix] BUG-01 ...`).
7. **Cuối mỗi giai đoạn:** cập nhật các file `docs/` liên quan cho khớp với code, rồi gắn git tag.

---

## 5. Cách kiểm thử (áp dụng cho mọi giai đoạn)

| Mức | Làm gì | Công cụ |
|---|---|---|
| **Tự động — logic** | Test các hàm có luật nghiệp vụ: vòng đời Object, gán/gỡ Space, liên kết, phụ thuộc, ôn tập, thông báo | Jest (có sẵn trong NestJS) |
| **Tự động — API** | Gọi thử API thật với cơ sở dữ liệu test: đúng mã lỗi, không xem được dữ liệu người khác | Jest + Supertest |
| **Thủ công — giao diện** | Đi theo checklist của từng giai đoạn, thử ở 3 cỡ màn hình (375px điện thoại, 768px máy tính bảng, 1280px laptop) | Trình duyệt |
| **(Sau) Tự động — giao diện** | 3–5 luồng quan trọng nhất chạy tự động | Playwright (tuỳ chọn, giai đoạn cuối) |

Nguyên tắc: **cái gì có luật thì phải có test tự động**; cái gì là giao diện thì có checklist thủ công.
