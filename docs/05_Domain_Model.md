# 05_Domain_Model.md — Mô hình nghiệp vụ

> Tài liệu trước: [03_Functional_Analysis.md](03_Functional_Analysis.md) và [04_System_Architecture.md](04_System_Architecture.md)
> Tài liệu sau: [06_Database_Design.md](06_Database_Design.md)
>
> Mô tả **ý nghĩa nghiệp vụ**, độc lập với cách lưu trong CSDL (kiểu dữ liệu, khoá ngoại: xem doc 06).

---

## 1. Các thực thể nghiệp vụ

### User (Người dùng)
Chủ sở hữu tài khoản. Có vai trò **USER** hoặc **ADMIN**. Mọi dữ liệu khác đều thuộc về đúng một User. Có thể bị Admin **khoá** (không đăng nhập được) hoặc tạm khoá do nhập sai mật khẩu nhiều lần.

### Space (Không gian)
"Bàn làm việc" do người dùng tự đặt tên, biểu tượng, màu, **mục tiêu** và **hạn chót**. Space **không sở hữu** Object — chỉ là ngữ cảnh để xem nhóm các Object. Mỗi Space tự bật/tắt các công cụ (Kanban, Lịch, Tiến độ) và có tiến độ = số Task đã xong / tổng số Task. Space không lồng nhau (xem lý do ở `plan/02_Quyet_Dinh.md`, QD-02).

### Object (Mục — hạt nhân đa hình)
Mọi nội dung là một Object thuộc một trong 4 loại:

| Loại | Ý nghĩa | Thuộc tính riêng |
|---|---|---|
| `TASK` | Việc cần làm | trạng thái, ưu tiên, hạn chót, ước lượng thời gian, luật lặp, thời điểm hoàn thành |
| `NOTE` | Ghi chú Markdown, có thể chứa thẻ ôn tập (`Hỏi :: Đáp`) và liên kết `[[Tiêu đề]]` | — |
| `EVENT` | Sự kiện có giờ bắt đầu/kết thúc | ưu tiên, luật lặp |
| `REFERENCE` | Tài liệu tham khảo | URL |

Thuộc tính chung: tiêu đề, mô tả, **vòng đời** (`ACTIVE`, `ARCHIVED`, `TRASH`).
Một loại có thể **chuyển** sang loại khác bằng thao tác riêng (ví dụ Note → Task); các trường không còn ý nghĩa bị bỏ.

### SpaceObject (Vị trí gán)
Một Object có thể nằm ở **nhiều** Space cùng lúc (không nhân bản dữ liệu), hoặc không ở Space nào (Hộp nhận). Mỗi vị trí có thứ tự (`position`) và cờ **ghim** riêng cho từng Space.

### ObjectRelation (Liên kết)
Liên kết **có hướng** giữa hai Object của cùng một người dùng, hiển thị được cả hai chiều (backlink):

| Loại | Ý nghĩa | Hệ thống làm gì với nó |
|---|---|---|
| `RELATES_TO` | Liên quan | Hiển thị, vẽ trên bản đồ tri thức |
| `REFERENCES` | Tham khảo | Hiển thị; ôn tập ưu tiên Note được tham khảo bởi việc sắp đến hạn |
| `DEPENDS_ON` | A phụ thuộc B (B phải xong trước) | Khoá 🔒 việc bị chặn, cấm vòng, gợi ý kế hoạch, báo "được mở khoá" |
| `PARENT_OF` | Việc cha – việc con | Tiến độ việc cha, một việc chỉ một cha |

Liên kết có cờ **auto** nếu do hệ thống sinh từ `[[Tiêu đề]]` trong nội dung (tự xoá khi không còn được nhắc).

### Flashcard (Thẻ ôn tập) và FlashcardReview (Lượt ôn)
Thẻ sinh từ các dòng `Câu hỏi :: Trả lời` trong một Note. Mỗi thẻ có trạng thái ôn theo **SM-2** (hệ số dễ, khoảng cách ngày, số lần nhớ liên tiếp, ngày đến hạn). Mỗi lần ôn được ghi lại (mức chấm Quên/Khó/Nhớ/Dễ) để thống kê.

### StudySession (Phiên tập trung)
Thời gian học thật ghi từ đồng hồ Pomodoro (1–240 phút), có thể gắn với một Task/Note.

### Notification và NotificationSettings
Thông báo do hệ thống sinh (sắp hạn, quá hạn, sự kiện, bản tin sáng, đến lúc ôn, được mở khoá, thông báo hệ thống). Mỗi thông báo có **khoá chống trùng**. Cài đặt riêng từng người: nhắc trước bao lâu, bật/tắt từng loại, giờ yên lặng.

### PasswordReset và AdminAuditLog
Token đặt lại mật khẩu (chỉ lưu băm, hết hạn, dùng một lần) và nhật ký hành động quản trị (không chứa nội dung cá nhân).

---

## 2. Quan hệ giữa các thực thể

- `User 1—n Space`, `User 1—n Object`: mọi dữ liệu thuộc đúng một người dùng.
- `Space n—m Object` qua `SpaceObject` (vị trí, ghim).
- `Object n—m Object` qua `ObjectRelation` (có hướng, có loại).
- `Note 1—n Flashcard` → `Flashcard 1—n FlashcardReview`.
- `User 1—1 NotificationSettings`, `User 1—n Notification`; `Notification n—1 Object` (tuỳ chọn).
- `User 1—n StudySession` (liên kết tuỳ chọn tới Object).

Sơ đồ quan hệ đầy đủ ở dạng ERD (Mermaid): xem [06_Database_Design.md](06_Database_Design.md#2-sơ-đồ-erd).

> Sơ đồ UML vẽ tay `diagrams/05_Domain_Model.drawio` là bản cũ (còn Tag, có khoá ngoại và quan hệ Object–Tag sai bội số); cần vẽ lại khi chốt báo cáo.

---

## 3. Vòng đời Object

```
        ┌──────── Lưu trữ ────────┐
        ▼                         │
     ARCHIVED ◄──────────────► ACTIVE ──── Chuyển vào Thùng rác ───► TRASH ──► Xoá vĩnh viễn
        │                         ▲                                   │
        └──── Chuyển vào Thùng rác ┘                                   │
        ▲                                                             │
        └──────── Khôi phục (về đúng trạng thái trước đó) ◄───────────┘
```

- **ACTIVE:** hiển thị bình thường, được nhắc hạn.
- **ARCHIVED:** ẩn khỏi màn hình làm việc, không nhắc, vẫn giữ vị trí và liên kết.
- **TRASH:** xoá mềm, ẩn hoàn toàn, vẫn giữ vị trí và liên kết để khôi phục; không nhắc, không lên bản đồ.
- **Xoá vĩnh viễn:** chỉ từ Thùng rác; dọn luôn vị trí gán, liên kết, thẻ ôn.

## 4. Trạng thái và độ ưu tiên

- Task: `TODO`, `IN_PROGRESS`, `DONE`, `CANCELLED`. Chuyển **tự do** giữa các trạng thái (Kanban kéo thả, nút tick); việc đã huỷ không tính vào tiến độ và báo cáo.
- Ưu tiên (Task, Event): `LOW`, `MEDIUM`, `HIGH`, `URGENT`.

## 5. Quy tắc nghiệp vụ cốt lõi (Business Invariants)

1. **Gỡ khỏi Space không làm mất dữ liệu gốc.** Không còn Space nào thì Object về Hộp nhận. Xoá Space cũng chỉ gỡ Object ra.
2. **Một nội dung — nhiều ngữ cảnh.** Sửa Object ở một Space thì mọi Space chứa nó thấy ngay (vì chỉ có một bản).
3. **Toàn vẹn liên kết.** Không tự liên kết; không trùng cùng loại cùng chiều; không liên kết mục trong Thùng rác; `DEPENDS_ON`/`PARENT_OF` chỉ giữa Task và **không tạo vòng**; một việc chỉ có một việc cha.
4. **Loại quyết định trường.** Event bắt buộc có giờ bắt đầu; Reference bắt buộc có URL; chỉ Task có trạng thái và ước lượng; chỉ Task/Event có ưu tiên và luật lặp (cũng được CSDL kiểm tra bằng `CHECK`).
5. **Nhắc nhở thông minh.** Chỉ nhắc mục `ACTIVE`, chưa xong/huỷ; không báo trùng; tôn trọng giờ yên lặng; xong/huỷ/vào Thùng rác thì dọn nhắc chưa đọc.
6. **Cách ly dữ liệu.** Người dùng chỉ truy cập dữ liệu của chính mình; truy cập dữ liệu người khác như thể nó không tồn tại (404).
7. **Quyền riêng tư của quản trị viên.** Admin chỉ thấy thông tin tài khoản và số liệu tổng hợp, không bao giờ thấy nội dung.
8. **Lặp lại.** Task lặp được đánh dấu xong thì sinh đúng một lần kế tiếp (không sinh trùng dù mở lại rồi xong lần nữa).

---

*Tiếp theo: [06_Database_Design.md](06_Database_Design.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
