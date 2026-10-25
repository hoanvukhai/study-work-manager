# 12_Report_Notes.md — Ghi chú cho báo cáo tốt nghiệp

> Tài liệu trước: [11_Deployment.md](11_Deployment.md)
> Tài liệu sau: Báo cáo luận văn tốt nghiệp trong `report/`
>
> Số liệu cập nhật ngày 25/10/2026 (đối chiếu từ mã nguồn và kết quả chạy test thật).

---

## 1. Số liệu quan trọng

| Chỉ số | Giá trị | Nguồn |
|---|---|---|
| Bảng cơ sở dữ liệu | **12** (7 enum), 12 migration, 13 ràng buộc `CHECK` | doc 06 |
| API endpoint | **59** (Swagger tại `/api/docs`) | doc 07 |
| Test tự động | **235** (82 unit + 153 API tích hợp), tất cả đạt | doc 10 |
| Thuật toán tự cài đặt | 6: phát hiện vòng (đồ thị), chấm điểm gợi ý, SM-2, lặp lại, bố cục đồ thị lực đẩy–kéo, sinh iCalendar | doc 09 |
| Thành phần giao diện dùng chung | 13 component + khung chi tiết duy nhất | doc 09 |
| Màn hình chính | Tổng quan, Không gian, Kanban, Lịch (tuần/tháng), Hộp nhận, Lưu trữ, Thùng rác, Học tập, Bản đồ tri thức, Báo cáo tuần, Thông báo, Hồ sơ, Quản trị | doc 08 |

## 2. Điểm nổi bật khi bảo vệ

1. **"Một Object, ba góc nhìn".** Việc, ghi chú, sự kiện, tài liệu là **cùng một loại thẻ** nên hệ thống kết hợp được những thứ vốn nằm ở ba ứng dụng khác nhau (Todoist, Anki, Obsidian): *kế hoạch* đọc các liên kết "phải làm trước"; *học tập* ôn ghi chú đúng lúc sắp quên; *tri thức* vẽ chính các liên kết đó thành bản đồ. Ví dụ liên thông: sắp phải làm "Viết module Auth" → hệ thống ưu tiên nhắc ôn ghi chú "JWT" đang liên kết với việc đó.
2. **Mô hình dữ liệu hạt nhân đa hình + gán nhiều ngữ cảnh.** Một nội dung nằm ở nhiều Không gian mà không sao chép; gỡ khỏi Không gian không mất dữ liệu.
3. **Thuật toán tự cài đặt, có giải thích được và có test:** cấm vòng phụ thuộc, gợi ý kèm lý do, SM-2, lặp lại.
4. **Chất lượng kỹ thuật:** ràng buộc nhiều tầng (DTO → Service → `CHECK` ở CSDL), migration có đánh số, cách ly dữ liệu được kiểm thử có hệ thống, bảo mật đăng nhập (khoá tạm, giới hạn tần suất, header bảo mật, token đặt lại mật khẩu chỉ lưu băm), quyền riêng tư của quản trị viên được kiểm chứng bằng test.
5. **Đóng gói triển khai được:** chạy cả hệ thống bằng một lệnh Docker (đã chạy thử thật).

## 3. Câu hỏi hội đồng có thể hỏi và hướng trả lời

| Câu hỏi | Hướng trả lời ngắn |
|---|---|
| Khác Notion/Todoist/Obsidian ở đâu? | Lấy cảm hứng từ Capacities/Tana/Obsidian, đơn giản hoá cho người học; điểm riêng là **kết hợp lập kế hoạch + ôn tập + đồ thị tri thức trên cùng một mô hình dữ liệu** (ví dụ ôn theo ngữ cảnh việc sắp đến hạn). |
| Space khác Tag ở đâu? Sao bỏ Tag? | Một Object nằm được nhiều Space nên Space đã là phân loại ngang; giữ cả hai khiến người dùng lại phải phân vân — đúng vấn đề đề tài giải quyết. Space còn có mục tiêu, hạn chót, tiến độ, thứ tự, ghim, công cụ riêng. |
| Sao gộp 4 loại vào một bảng? | Các tính năng chính đi xuyên nhiều loại (lịch gộp Task+Event, liên kết Note↔Task, chuyển Note→Task). Đánh đổi là cột rỗng — kiểm soát bằng `CHECK` theo loại. |
| Liên kết dùng để làm gì ngoài hiển thị? | `DEPENDS_ON` quyết định việc nào bị chặn/được gợi ý; `PARENT_OF` tính tiến độ; `[[ ]]` tự sinh liên kết; tất cả vẽ thành bản đồ. |
| Nhắc nhở nếu người dùng không mở app? | Bộ quét nền tạo thông báo; thêm **lịch `.ics`** để Google Calendar nhắc trên điện thoại; email cho quên mật khẩu. (Thông báo đẩy là hướng phát triển.) |
| Phần "học tập" nằm ở đâu? | Thẻ hỏi–đáp từ ghi chú, ôn tập ngắt quãng SM-2, Pomodoro, thống kê và báo cáo tuần. |
| Admin có đọc được ghi chú không? | Không — API admin chỉ trả thông tin tài khoản và số liệu tổng hợp; có test chứng minh. |
| Kiểm thử thế nào? | 235 test tự động chạy trên PostgreSQL thật (cách ly dữ liệu, ràng buộc, thuật toán, múi giờ...) + checklist thủ công. |
| Hạn chế? | Token ở `localStorage`; chưa có tệp đính kèm, thông báo đẩy, cộng tác nhóm; bộ quét nền chạy trong tiến trình API. |

## 4. Hình ảnh cần đưa vào báo cáo

- **Chương 3 (Phân tích & thiết kế):** Context Diagram, kiến trúc phân tầng, Domain Model (**vẽ lại** — bản drawio cũ còn Tag), ERD (dùng sơ đồ Mermaid ở doc 06 hoặc xuất lại), wireframe các màn hình.
- **Chương 4 (Hiện thực):** ảnh chụp ứng dụng thật: Tổng quan (thẻ "Hôm nay làm gì?"), Không gian (tiến độ, ghim), Kanban có 🔒, khung chi tiết (Kế hoạch, thẻ ôn tập), trang Học tập, Bản đồ tri thức, Báo cáo tuần, Quản trị; kết quả `npm test` và `npm run test:e2e`.

## 5. Hướng phát triển (Chương 5)

- **Ngắn hạn:** thông báo đẩy/PWA, email bản tin sáng, kéo thả trên Kanban lưu thứ tự, file đính kèm cho Tài liệu, test giao diện tự động (Playwright).
- **Trí tuệ nhân tạo (có người duyệt):** gõ câu thường thành việc, tạo thẻ ôn từ ghi chú, tóm tắt tuần, gợi ý liên kết.
- **Cộng tác nhóm:** chia sẻ Không gian, giao việc, bình luận — cần giải quyết bài toán một Object nằm ở cả Không gian nhóm và cá nhân (ai thấy gì, ai được xoá).
- **Thuộc tính tuỳ biến** (thay Tag): người dùng tự định nghĩa trường cho mục (Môn học, Khách hàng...).
- **Tự xếp lịch:** dùng ước lượng thời gian + khoảng trống trong lịch để đề xuất giờ làm.
- **Bảo mật nâng cao:** cookie `HttpOnly` + refresh token, xác thực hai lớp.

---

*Quay lại mục lục: [docs/README.md](README.md)*
