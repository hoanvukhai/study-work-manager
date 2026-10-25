# 07 — Kế hoạch làm thêm trước khi kiểm thử chung

> Lập 25/10/2026. Mục tiêu: **mọi chức năng cơ bản dùng được** + vài mở rộng giá trị cao, công sức thấp, để bạn test một thể.
> Mỗi mục có test tự động. Trạng thái: `[ ]` chưa · `[x]` xong. Cuối mỗi mục ghi mức đã tự kiểm bằng mắt.

## Nhóm 1 — Cơ bản còn thiếu

| # | Việc | Cách làm | Trạng thái |
|---|---|---|:-:|
| 1 | Bảo mật đăng nhập | `helmet`, giới hạn tần suất gọi API (`@nestjs/throttler`), khoá tạm 15 phút sau 5 lần sai (FR-AUTH-10), thông báo lỗi giống nhau để không lộ tài khoản | [ ] |
| 2 | Giới hạn danh sách + CORS theo môi trường | `GET /objects` có `limit`/`offset` (mặc định tối đa 500) + header tổng số; `CORS_ORIGIN` lấy từ biến môi trường | [ ] |
| 3 | Tạo đủ 4 loại trên giao diện | Kiểm hộp "Tạo mới": Event (giờ bắt đầu/kết thúc), Reference (URL); sửa nếu thiếu | [ ] |
| 4 | Hiển thị Markdown cho Note | Tab "Soạn / Xem" trong khung chi tiết; dùng `react-markdown` (không cho HTML thô → an toàn XSS) | [ ] |
| 5 | Kéo thả sắp xếp | Kéo thả trong danh sách Không gian (dùng API `reorder` có sẵn), giữ nút ↑↓ cho bàn phím/điện thoại | [ ] |
| 6 | Việc / sự kiện lặp lại | Cột `recurrence` (hằng ngày/tuần/tháng, mỗi N, hạn kết thúc). Task xong → tự sinh lần kế tiếp; Event đã qua → bộ quét sinh lần kế tiếp | [ ] |
| 7 | Cảnh báo dời hạn | Dời hạn một việc làm các việc đang chờ nó bị trễ theo → trả cảnh báo, giao diện hiện toast | [ ] |

## Nhóm 2 — Mở rộng đã chọn (giá trị cao, công sức thấp)

| # | Việc | Ghi chú | Trạng thái |
|---|---|---|:-:|
| 8 | Quên / đặt lại mật khẩu (FR-AUTH-08, 09) | Token băm, hết hạn 30 phút, dùng một lần. Gửi email qua SMTP nếu cấu hình, không thì ghi link ra log (chế độ dev) | [ ] |
| 9 | Xuất lịch `.ics` | Địa chỉ riêng có token; Google Calendar / điện thoại đăng ký theo dõi, tự nhắc | [ ] |
| 10 | Báo cáo tuần | Việc xong/trễ, thẻ đã ôn, phút tập trung, so với tuần trước; trang `/reports` | [ ] |
| 11 | Mẫu Không gian | "Môn học", "Đồ án", "Dự án freelance": tạo Không gian kèm công cụ + việc mẫu | [ ] |
| 12 | Xuất dữ liệu cá nhân | Tải JSON toàn bộ dữ liệu của mình (quyền sở hữu dữ liệu) | [ ] |

## Nhóm 3 — Hoàn thiện nộp bài

| # | Việc | Trạng thái |
|---|---|:-:|
| 13 | Cấu hình triển khai: Dockerfile backend + frontend, `docker-compose` chạy cả hệ thống, `.env.example` đủ biến | [ ] |
| 14 | Đồng bộ `docs/` 02, 03, 05, 06, 07 và README với code mới (bỏ Tag/Space lồng nhau, đủ bảng, danh sách API sinh từ code) | [ ] |

## Cố ý chưa làm (để dành cho bạn quyết định / hướng phát triển)

- **AI** (cần khoá API và quyết định về quyền riêng tư), **cộng tác nhóm** (QD-14), **file đính kèm** (cần chỗ lưu file + quét an toàn), **PWA/thông báo đẩy/Telegram**, **test giao diện tự động Playwright** (nên làm sau khi bạn test tay và chốt giao diện).
