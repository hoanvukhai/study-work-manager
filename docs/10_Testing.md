# 10_Testing.md — Kiểm thử

> Tài liệu trước: [09_Implementation.md](09_Implementation.md)
> Tài liệu sau: [11_Deployment.md](11_Deployment.md)
>
> Số liệu và danh sách bên dưới được sinh từ **kết quả chạy thật** của bộ test (không viết tay).

---

## 1. Chiến lược kiểm thử

| Mức | Công cụ | Mục tiêu | Số test | Kết quả |
|---|---|---|--:|---|
| **Unit** | Jest + ts-jest | Hàm thuần và logic nghiệp vụ không cần CSDL: thuật toán (đồ thị, chấm điểm, SM-2, lặp lại), tách cú pháp, múi giờ, sinh `.ics` | 82 | 82 đạt, 0 lỗi |
| **API tích hợp (e2e)** | Jest + Supertest + **PostgreSQL thật** | Gọi API thật qua HTTP trên CSDL test riêng `study_work_test` (áp toàn bộ migration): quyền, cách ly dữ liệu, ràng buộc, luồng nghiệp vụ | 153 | 153 đạt, 0 lỗi |
| **Thủ công** | Trình duyệt | Giao diện: 3 cỡ màn hình (375/768/1280), sáng/tối, bàn phím, kịch bản demo | — | Làm chung cuối giai đoạn (xem `plan/`) |

**Nguyên tắc:** cái gì có *luật nghiệp vụ* thì có test tự động; cái gì là *giao diện* thì có checklist thủ công. Lỗi từng bắt được nhờ test (ví dụ SM-2 dùng sai thứ tự công thức, lỗi múi giờ làm lệch lịch) được ghi trong nhật ký `plan/05_Nhat_Ky.md`.

## 2. Cách chạy

```bash
docker compose up -d            # bật PostgreSQL (cổng 5435)
cd backend
npm test                        # unit test
npm run test:e2e                # test API (tự tạo CSDL study_work_test, áp migration)
npx tsc --noEmit                # kiểm tra kiểu
cd ../frontend && npx tsc --noEmit && npm run build
```

## 3. Các nhóm kiểm thử đặc biệt quan trọng

- **Cách ly dữ liệu (NFR-SEC-03):** người A không xem / sửa / xoá / gán / liên kết / ôn / xuất được dữ liệu của người B ở mọi nhóm endpoint; trả 404.
- **Quyền riêng tư của Admin:** test gọi mọi API admin rồi kiểm tra phản hồi **không chứa** tiêu đề, nội dung, URL, tên Không gian của người dùng; Admin cũng không đọc được dữ liệu người khác qua API thường.
- **Ràng buộc ở mức CSDL:** chèn dữ liệu sai bằng SQL trực tiếp bị từ chối (`CHECK`).
- **Bảo mật đăng nhập:** khoá tạm, thông báo lỗi giống nhau (không lộ tài khoản), giới hạn tần suất, header bảo mật, token đặt lại mật khẩu chỉ lưu băm.
- **Tính đúng của thuật toán:** vòng phụ thuộc, SM-2, lặp lại (kẹp ngày cuối tháng), múi giờ ở biên 23:30/00:30, giờ yên lặng vắt qua nửa đêm.

## 4. Danh sách test theo tệp

### 4.1. Unit test

**`ics.spec.ts`** — Sinh file iCalendar (thoát ký tự, gấp dòng 75 octet) (7/7 đạt)

- ✅ thoát ký tự đặc biệt: \ ; , và xuống dòng
- ✅ định dạng thời gian UTC
- ✅ gấp dòng dài: mỗi dòng ≤ 75 octet, dòng nối bắt đầu bằng dấu cách, ghép lại không mất ký tự
- ✅ dòng ngắn không bị gấp
- ✅ lịch có cấu trúc hợp lệ: VCALENDAR/VEVENT/VALARM, kết thúc bằng CRLF, kết thúc mặc định +30 phút
- ✅ sự kiện có giờ kết thúc hợp lệ thì dùng giờ đó; kết thúc không sau bắt đầu thì dùng +30 phút
- ✅ không có sự kiện vẫn là lịch hợp lệ

**`mentions.spec.ts`** — Tách `[[Tiêu đề]]` (5/5 đạt)

- ✅ lấy các tiêu đề trong [[ ]], giữ thứ tự xuất hiện
- ✅ cắt khoảng trắng hai đầu và bỏ trùng không phân biệt hoa thường
- ✅ bỏ qua [[]] rỗng, chỉ có khoảng trắng và ngoặc không đóng
- ✅ không bắt qua nhiều dòng và không bắt ngoặc lồng
- ✅ null / rỗng trả mảng rỗng; tiêu đề quá dài bị bỏ

**`objects.service.spec.ts`** — Object: ràng buộc theo loại, vòng đời, chuyển loại, dọn Thùng rác (9/9 đạt)

- ✅ 1. Nên ném lỗi BadRequestException nếu tạo EVENT có endAt <= startAt (SEC-06, QD-07)
- ✅ 2. Nên ném lỗi BadRequestException nếu tạo REFERENCE có URL sai định dạng (SEC-06, QD-07)
- ✅ 3. Nên tạo thành công TASK với status mặc định là TODO và priority là MEDIUM (BUG-07 Transaction)
- ✅ 4. Nên cập nhật vòng đời sang TRASH và ghi nhận deletedAt (QD-05)
- ✅ 5. Nên cập nhật vòng đời sang ARCHIVED và ghi nhận archivedAt (QD-05)
- ✅ 6. Nên khôi phục vòng đời về ACTIVE và xoá archivedAt, deletedAt (QD-05)
- ✅ 7. Không cho phép cập nhật nếu sự kiện sửa endAt <= startAt (SEC-06)
- ✅ 8. Chuyển loại Note sang Task thiết lập status TODO và priority MEDIUM (QD-06)
- ✅ 9. Dọn sạch Thùng rác xóa vĩnh viễn các đối tượng TRASH của user (BUG-03)

**`planning.spec.ts`** — Phát hiện vòng phụ thuộc (đồ thị), chấm điểm "Hôm nay làm gì?", mức tải (14/14 đạt)

- ✅ tự phụ thuộc chính mình là vòng
- ✅ đồ thị rỗng: thêm cạnh bất kỳ không tạo vòng
- ✅ C phụ thuộc A khép kín chuỗi A→B→C→A (vòng gián tiếp)
- ✅ B phụ thuộc A tạo vòng trực tiếp A⇄B
- ✅ cạnh đi cùng chiều hoặc sang nhánh khác không tạo vòng
- ✅ không lặp vô hạn khi đồ thị có nhánh rẽ và hội tụ (kim cương)
- ✅ quá hạn điểm cao hơn hạn trong 24h, cao hơn hạn trong tuần, cao hơn không có hạn
- ✅ ưu tiên cao hơn thì điểm cao hơn khi cùng hạn
- ✅ việc mở khoá nhiều việc khác được cộng điểm, tối đa 15
- ✅ đang làm dở được cộng điểm
- ✅ việc bị chặn không được gợi ý mà nằm trong danh sách blocked kèm tiền đề
- ✅ sắp theo điểm giảm dần, hoà điểm thì hạn gần hơn trước, tối đa 5 gợi ý
- ✅ mức tải: cộng thời gian ước lượng của việc có hạn trong 7 ngày, báo quá tải khi vượt 28 giờ
- ✅ việc có hạn sau 7 ngày không tính vào mức tải tuần này

**`recurrence.spec.ts`** — Tính lần lặp kế tiếp (ngày/tuần/tháng, kẹp cuối tháng, until) (8/8 đạt)

- ✅ hằng ngày / mỗi N ngày / hằng tuần
- ✅ hằng tháng giữ nguyên ngày; kẹp về ngày cuối tháng khi tháng sau ngắn hơn
- ✅ qua ranh giới năm; việc lúc 23:30 VN không trượt sang ngày khác
- ✅ bỏ qua các lần đã lỡ: lấy lần đầu tiên sau mốc `after`
- ✅ dừng khi vượt ngày kết thúc (until), bao gồm đúng ngày kết thúc
- ✅ chấp nhận luật hợp lệ
- ✅ từ chối luật sai
- ✅ mô tả bằng tiếng Việt

**`rules.spec.ts`** — Giờ yên lặng, phân loại sắp hạn/quá hạn, định dạng thời gian (9/9 đạt)

- ✅ tính theo giờ Việt Nam (UTC+7)
- ✅ tắt công tắc thì không bao giờ yên lặng
- ✅ khoảng trong ngày: 13:00–15:00 VN
- ✅ khoảng vắt qua nửa đêm: 23:00–07:00 VN
- ✅ đúng biên: bắt đầu tính, kết thúc không tính; bắt đầu = kết thúc thì không có khoảng yên lặng
- ✅ sắp đến hạn khi nằm trong khoảng nhắc trước; ngoài khoảng thì chưa nhắc
- ✅ quá hạn trong 7 ngày thì nhắc; quá lâu thì bỏ qua
- ✅ formatVn hiển thị giờ Việt Nam
- ✅ describeDistance chọn đơn vị phù hợp

**`spaces.service.spec.ts`** — Space: tạo, lọc lưu trữ, xoá giữ nguyên Object (3/3 đạt)

- ✅ 1. Nên tạo Space độc lập không có parentId (QD-02, triệt tiêu SEC-01)
- ✅ 2. Mặc định chỉ lấy các Space chưa lưu trữ (archivedAt = null) (QD-04)
- ✅ 3. Xoá Space chỉ xoá bảng Space (Object bên trong được an toàn) (QD-04)

**`study.spec.ts`** — SM-2, tách thẻ `::`, chuỗi ngày học, múi giờ Việt Nam (16/16 đạt)

- ✅ lần đầu nhớ: ôn lại sau 1 ngày; lần hai: 6 ngày; lần ba: nhân hệ số dễ
- ✅ chuỗi điểm mẫu kinh điển: Dễ-Dễ-Dễ cho khoảng cách 1 → 6 → 17 ngày, hệ số dễ tăng 0,1 mỗi lần
- ✅ Quên: về học lại từ đầu, hiện lại sau 10 phút, giữ nguyên hệ số dễ
- ✅ Khó nhớ giảm hệ số dễ 0,14; hệ số không bao giờ thấp hơn 1,3
- ✅ Nhớ (q=4) giữ nguyên hệ số dễ
- ✅ thẻ nhớ tốt hơn thì lần ôn tiếp theo xa hơn
- ✅ lấy các dòng "Hỏi :: Đáp", chấp nhận gạch đầu dòng, bỏ dòng thường
- ✅ bỏ dòng thiếu vế; trùng câu hỏi thì dòng sau thắng; xử lý xuống dòng kiểu Windows
- ✅ đáp án được chứa dấu "::" thứ hai; rỗng/null trả mảng rỗng
- ✅ đếm các ngày liên tiếp đến hôm nay
- ✅ hôm nay chưa học thì chuỗi vẫn giữ tính từ hôm qua
- ✅ lỡ cả hôm qua thì chuỗi về 0; đứt giữa chừng thì chỉ đếm đoạn gần nhất
- ✅ qua ranh giới tháng/năm
- ✅ 23:30 giờ VN và 00:30 giờ VN thuộc hai ngày khác nhau
- ✅ startOfLocalDay là 00:00 giờ VN (17:00 UTC hôm trước)
- ✅ localDateKeyDaysAgo lùi đúng số ngày

**`templates.spec.ts`** — Dữ liệu mẫu Không gian hợp lệ, không có vòng phụ thuộc (7/7 đạt)

- ✅ mẫu "course": khoá mục không trùng, tiêu đề không rỗng, màu hợp lệ
- ✅ mẫu "project": khoá mục không trùng, tiêu đề không rỗng, màu hợp lệ
- ✅ mẫu "freelance": khoá mục không trùng, tiêu đề không rỗng, màu hợp lệ
- ✅ mẫu "course": phụ thuộc chỉ giữa các Task có thật và không tạo vòng
- ✅ mẫu "project": phụ thuộc chỉ giữa các Task có thật và không tạo vòng
- ✅ mẫu "freelance": phụ thuộc chỉ giữa các Task có thật và không tạo vòng
- ✅ id mẫu duy nhất và tra cứu được

**`week.spec.ts`** — Tính đầu tuần (thứ Hai, giờ Việt Nam) (4/4 đạt)

- ✅ giữa tuần → thứ Hai cùng tuần
- ✅ Chủ nhật 23:59 vẫn thuộc tuần đó
- ✅ đúng 00:00 thứ Hai là đầu tuần mới; trước đó 1 phút vẫn là tuần cũ
- ✅ thứ Hai 00:30 giờ VN (vẫn là Chủ nhật theo UTC) thuộc tuần mới

### 4.2. Test API tích hợp (e2e)

**`account-export.e2e-spec.ts`** — Xuất dữ liệu cá nhân (4/4 đạt)

- ✅ trả đủ dữ liệu của người dùng, kể cả mục trong Thùng rác, kèm tệp tải về
- ✅ không chứa dữ liệu của người khác
- ✅ không bao giờ chứa mật khẩu, token lịch hay token đặt lại mật khẩu
- ✅ phải đăng nhập mới tải được

**`admin.e2e-spec.ts`** — Phân quyền ADMIN, khoá tài khoản, thống kê, KHÔNG lộ nội dung cá nhân (22/22 đạt)

- ✅ người dùng thường gọi get /api/v1/admin/users → 403
- ✅ người dùng thường gọi get /api/v1/admin/stats → 403
- ✅ người dùng thường gọi get /api/v1/admin/audit-logs → 403
- ✅ người dùng thường gọi post /api/v1/admin/broadcast → 403
- ✅ người dùng thường gọi patch /api/v1/admin/users/00000000-0000-4000-8000-000000000000/lock → 403
- ✅ người dùng thường gọi patch /api/v1/admin/users/00000000-0000-4000-8000-000000000000/unlock → 403
- ✅ chưa đăng nhập gọi get /api/v1/admin/users → 401
- ✅ chưa đăng nhập gọi get /api/v1/admin/stats → 401
- ✅ chưa đăng nhập gọi get /api/v1/admin/audit-logs → 401
- ✅ chưa đăng nhập gọi post /api/v1/admin/broadcast → 401
- ✅ chưa đăng nhập gọi patch /api/v1/admin/users/00000000-0000-4000-8000-000000000000/lock → 401
- ✅ chưa đăng nhập gọi patch /api/v1/admin/users/00000000-0000-4000-8000-000000000000/unlock → 401
- ✅ Admin gọi được
- ✅ chỉ trả thông tin tài khoản và con số tổng hợp, kèm phân trang và tìm kiếm
- ✅ không API admin nào trả tiêu đề, nội dung, URL hay tên Không gian của người dùng
- ✅ Admin không dùng được API thường để đọc dữ liệu người khác (cách ly theo userId vẫn áp dụng)
- ✅ không tự khoá chính mình, không khoá Admin khác, id lạ → 404, id sai định dạng → 400
- ✅ khoá thì không đăng nhập được và token cũ bị từ chối; mở khoá thì dùng lại được
- ✅ hạ vai trò: người từng là Admin mà bị đổi về USER thì mất quyền ngay (vai trò đọc lại từ CSDL)
- ✅ trả các con số tổng hợp và 14 ngày gần nhất theo giờ Việt Nam
- ✅ phát thông báo tới người dùng không bị khoá, ghi nhật ký; kiểm tra dữ liệu đầu vào
- ✅ người dùng thường không dùng được nhật ký / người bị khoá không nhận SYSTEM

**`api.e2e-spec.ts`** — Cách ly dữ liệu A/B, vòng đời, gán nhiều Space, ràng buộc loại, tài khoản (20/20 đạt)

- ✅ chưa đăng nhập thì bị từ chối (401)
- ✅ B không xem được Object của A (404)
- ✅ B không sửa, đổi vòng đời, xoá được Object của A
- ✅ B không xem/sửa/xoá được Space của A
- ✅ B không gán Object của A vào Space của B, cũng không gán Object của B vào Space của A
- ✅ B không tạo Object vào Space của A
- ✅ B không tạo, xem, xoá được liên kết dính tới Object của A
- ✅ danh sách và tìm kiếm của B không chứa dữ liệu của A
- ✅ không xoá vĩnh viễn được mục chưa nằm trong Thùng rác (400)
- ✅ API sửa thường không nhận type/lifecycle (400 do forbidNonWhitelisted)
- ✅ Lưu trữ → Thùng rác → Khôi phục thì quay về Lưu trữ; Khôi phục lần nữa về ACTIVE
- ✅ chuyển vào Thùng rác xong thì xoá vĩnh viễn được và dọn sạch gán Space + liên kết
- ✅ liên kết với mục trong Thùng rác bị chặn (QD-09)
- ✅ một Object nằm ở 2 Space; xoá 1 Space thì Object vẫn còn, xoá nốt thì về Hộp nhận
- ✅ Event thiếu giờ bắt đầu, hoặc kết thúc trước bắt đầu → 400
- ✅ Reference thiếu hoặc sai URL → 400
- ✅ Note không có status/priority; Task mặc định TODO + MEDIUM
- ✅ CSDL tự chặn dữ liệu sai dù đi đường tắt (CHECK constraint)
- ✅ mật khẩu dưới 8 ký tự bị từ chối; đăng nhập sai báo lỗi chung
- ✅ tài khoản bị khoá: sai mật khẩu vẫn báo lỗi chung, đúng mật khẩu mới báo bị khoá; token cũ bị chặn

**`calendar-feed.e2e-spec.ts`** — Lịch .ics: nội dung, token, quyền riêng tư (6/6 đạt)

- ✅ token ổn định giữa các lần gọi, 64 ký tự hex; đường dẫn lịch công khai (không cần đăng nhập)
- ✅ chứa Task chưa xong có hạn và Event; không chứa việc đã xong/huỷ, Thùng rác, Lưu trữ, Note, Tài liệu
- ✅ không lộ mô tả hay đường dẫn; không lộ dữ liệu của người dùng khác
- ✅ việc quá hạn quá 14 ngày hoặc xa hơn 1 năm không vào lịch
- ✅ tạo lại token: địa chỉ cũ ngừng hoạt động, địa chỉ mới dùng được
- ✅ token sai, sai định dạng, hoặc thiếu đuôi .ics → 404; tài khoản bị khoá → 404

**`knowledge.e2e-spec.ts`** — `[[ ]]` tự nối/xoá liên kết, backlink, bản đồ tri thức (9/9 đạt)

- ✅ tạo liên kết tự động khi tạo mục có nhắc tới mục khác (không phân biệt hoa thường)
- ✅ sửa nội dung: thêm nhắc thì thêm liên kết, bỏ nhắc thì xoá liên kết tự động
- ✅ liên kết tạo tay không bị xoá khi bỏ nhắc; nhắc trùng liên kết tay thì giữ bản tay
- ✅ không tự liên kết với chính mình; mục không tồn tại hoặc trong Thùng rác thì bỏ qua
- ✅ không bao giờ liên kết tới mục cùng tiêu đề của người dùng khác
- ✅ trùng tiêu đề trong cùng tài khoản: nối tới mục mới cập nhật nhất
- ✅ trả các mục đang hoạt động và liên kết giữa chúng; không có mục Thùng rác/Lưu trữ
- ✅ lọc theo Space
- ✅ người dùng khác không thấy nút hay cạnh của mình; cần đăng nhập; spaceId sai định dạng bị từ chối

**`notifications.e2e-spec.ts`** — Quét, chống trùng, cài đặt, giờ yên lặng, mở khoá, bản tin, cách ly (16/16 đạt)

- ✅ tạo thông báo sắp đến hạn, quét lại không tạo trùng, đổi hạn chót thì báo lại
- ✅ quá hạn: nhắc một lần mỗi ngày; quá hạn hơn 7 ngày hoặc chưa tới giờ nhắc thì bỏ qua
- ✅ sự kiện sắp diễn ra được nhắc; việc đã xong / Thùng rác / Lưu trữ thì không
- ✅ người dùng bị khoá không nhận thông báo
- ✅ mặc định nhắc trước 1 ngày; đổi còn 5 phút thì việc còn 2 giờ không được nhắc
- ✅ tắt từng loại thì loại đó không được tạo
- ✅ giờ yên lặng: đang trong khoảng yên lặng thì không tạo; ra khỏi khoảng thì tạo
- ✅ kiểm tra dữ liệu cài đặt: nhắc trước 1 phút, giờ yên lặng 2000 → 400
- ✅ đánh dấu Task xong thì xoá nhắc hạn chưa đọc của nó
- ✅ đưa vào Thùng rác cũng xoá nhắc hạn chưa đọc
- ✅ báo "được mở khoá" chỉ khi mọi việc tiền đề đã xong
- ✅ bản tin gộp việc đến hạn hôm nay + quá hạn + sự kiện; gửi lại không trùng; không có gì thì không gửi
- ✅ nhắc ôn tập khi có từ 5 thẻ đến hạn, một lần mỗi ngày
- ✅ đánh dấu đã đọc, đọc tất cả, xoá, đếm chưa đọc, lọc chưa đọc
- ✅ người khác không đọc / đánh dấu / xoá được thông báo của mình; read-all chỉ ảnh hưởng của mình
- ✅ phát thông báo hệ thống: gửi cho mọi người dùng không bị khoá, không gửi lặp

**`objects-list.e2e-spec.ts`** — limit/offset/X-Total-Count (5/5 đạt)

- ✅ trả header X-Total-Count là tổng số mục khớp, không phụ thuộc limit
- ✅ offset bỏ qua đúng số mục và không trùng với trang trước
- ✅ tổng số tính theo bộ lọc (tìm kiếm)
- ✅ từ chối limit vượt 500, limit = 0, offset âm
- ✅ mặc định vẫn trả đủ khi ít hơn giới hạn

**`password-reset.e2e-spec.ts`** — Quên/đặt lại mật khẩu (token băm, hết hạn, một lần) (9/9 đạt)

- ✅ email có thật và không có thật đều nhận cùng một phản hồi; chỉ email có thật nhận thư
- ✅ đặt lại thành công: mật khẩu cũ hết hiệu lực, mật khẩu mới đăng nhập được
- ✅ token chỉ dùng được một lần
- ✅ token hết hạn bị từ chối
- ✅ yêu cầu mới vô hiệu hoá liên kết cũ chưa dùng
- ✅ CSDL chỉ lưu băm của token, không lưu token gốc
- ✅ token sai định dạng hoặc không tồn tại; mật khẩu mới quá ngắn
- ✅ đặt lại mật khẩu cũng gỡ khoá tạm do nhập sai nhiều lần
- ✅ tài khoản bị Admin khoá không nhận thư đặt lại; email sai định dạng bị từ chối

**`planning.e2e-spec.ts`** — Phụ thuộc/việc con (cấm vòng), gợi ý hôm nay, cảnh báo dời hạn (9/9 đạt)

- ✅ cấm tạo vòng phụ thuộc trực tiếp và gián tiếp (A→B→C→A)
- ✅ chỉ áp dụng giữa các Task (Note/Event/Reference bị từ chối)
- ✅ một việc chỉ có một việc cha và không có vòng cha–con
- ✅ dời hạn việc tiền đề vượt hạn của việc đang chờ nó → trả planningWarnings
- ✅ việc phía sau đã xong thì không cảnh báo
- ✅ việc bị chặn không được gợi ý; xong tiền đề thì được mở khoá
- ✅ việc đã huỷ/ở Thùng rác không tính là tiền đề đang chặn
- ✅ thời gian ước lượng cộng vào mức tải; Note không có thời gian ước lượng
- ✅ người dùng khác không thấy việc của mình trong gợi ý

**`recurrence.e2e-spec.ts`** — Task/Event lặp lại, không sinh trùng, kiểm tra luật (12/12 đạt)

- ✅ xong Task hằng tuần thì sinh Task mới: hạn +7 ngày, trạng thái TODO, giữ Không gian và thông tin
- ✅ không sinh trùng khi mở lại rồi đánh dấu xong lần nữa
- ✅ lưu lại (gửi lại nguyên luật) một Task đã xong thì không sinh trùng khi mở lại rồi xong nữa
- ✅ làm trễ nhiều ngày: lần sau là mốc đầu tiên trong tương lai, không sinh một chuỗi việc quá khứ
- ✅ hết hạn lặp (until) thì không sinh nữa
- ✅ Task thường (không lặp) xong thì không sinh gì
- ✅ bộ quét sinh lần kế tiếp khi sự kiện đã bắt đầu, giữ nguyên độ dài; quét lại không sinh trùng
- ✅ sự kiện chưa bắt đầu thì chưa sinh
- ✅ Note / Reference không lặp được; Task cần hạn chót; Event cần giờ bắt đầu
- ✅ luật sai bị từ chối: kiểu lạ, khoảng 0, khoảng 53, ngày sai
- ✅ thêm / bỏ luật lặp bằng cách sửa; bỏ hạn chót khi đang lặp thì bị từ chối
- ✅ chuyển loại sang Note thì luật lặp bị bỏ; CSDL chặn luật lặp trên Note khi đi đường tắt

**`reports.e2e-spec.ts`** — Báo cáo tuần (7/7 đạt)

- ✅ báo cáo trống cho người dùng mới; tuần có đủ 7 ngày bắt đầu từ thứ Hai
- ✅ việc vừa xong được tính vào hôm nay; mở lại thì không còn tính (completedAt được xoá)
- ✅ sửa tiêu đề việc đã xong không làm dịch chuyển thời điểm hoàn thành sang tuần khác
- ✅ tỉ lệ đúng hạn và so với tuần trước
- ✅ thống kê học tập: lượt ôn, tỉ lệ nhớ, phút tập trung, số ngày hoạt động
- ✅ thống kê theo Không gian chỉ gồm việc đã xong trong tuần
- ✅ cách ly dữ liệu giữa người dùng; kiểm tra tham số

**`security.e2e-spec.ts`** — Khoá tạm sau 5 lần sai, giới hạn tần suất, header helmet (7/7 đạt)

- ✅ sai mật khẩu 5 lần thì bị khoá tạm; đúng mật khẩu trong lúc khoá vẫn bị từ chối, cùng một thông báo
- ✅ hết thời gian khoá thì đăng nhập lại được và bộ đếm được đặt lại
- ✅ đăng nhập đúng xen giữa các lần sai thì bộ đếm được đặt lại (không khoá oan)
- ✅ email không tồn tại trả đúng cùng thông báo như sai mật khẩu (không lộ tài khoản)
- ✅ khoá tạm do nhập sai không ảnh hưởng tài khoản khác
- ✅ giới hạn tần suất: vượt số lần cho phép trên endpoint đăng nhập thì bị 429
- ✅ có header bảo mật của helmet và không lộ X-Powered-By

**`space-templates.e2e-spec.ts`** — Tạo Không gian từ mẫu (7/7 đạt)

- ✅ liệt kê các mẫu với số việc và số ghi chú
- ✅ tạo từ mẫu "course": Không gian + đủ mục + đúng liên kết phụ thuộc
- ✅ tạo từ mẫu "project": Không gian + đủ mục + đúng liên kết phụ thuộc
- ✅ tạo từ mẫu "freelance": Không gian + đủ mục + đúng liên kết phụ thuộc
- ✅ việc phía sau trong chuỗi mẫu bị chặn, việc đầu chuỗi gợi ý được ngay
- ✅ đặt tên riêng; tạo nhiều lần không trùng dữ liệu; dữ liệu thuộc đúng người tạo
- ✅ mẫu không tồn tại → 404; thiếu mã mẫu hoặc tên quá dài → 400; mục Note không có trạng thái

**`space.e2e-spec.ts`** — Tiến độ, ghim, sắp xếp, công cụ bật/tắt (10/10 đạt)

- ✅ tính done/total chỉ trên Task đang hoạt động, bỏ việc đã huỷ và mục trong Thùng rác
- ✅ Không gian rỗng có progress 0/0; người khác không xem được (404)
- ✅ tạo và sửa goal + dueDate; xoá bằng null/rỗng
- ✅ ghim một mục chỉ ảnh hưởng Space đó (mục nằm ở 2 Space)
- ✅ đặt lại thứ tự theo danh sách gửi lên
- ✅ từ chối khi danh sách có mục không thuộc Space, trùng lặp, hoặc sai định dạng
- ✅ người khác không ghim / sắp xếp được trong Space của mình, kể cả khi biết id
- ✅ ghim mục không nằm trong Space → 404
- ✅ lưu cờ công cụ hợp lệ, gộp với giá trị cũ, bỏ khoá lạ và giá trị không phải boolean
- ✅ sanitizeSettings: mặc định rỗng, không nhận giá trị lạ

**`study.e2e-spec.ts`** — Thẻ ôn, SM-2 qua API, ôn theo ngữ cảnh, phiên học, thống kê (10/10 đạt)

- ✅ đồng bộ thẻ từ Note: tạo, cập nhật đáp án, xoá thẻ không còn trong nội dung
- ✅ đồng bộ lại không làm mất tiến độ ôn của thẻ đã có
- ✅ chỉ tạo thẻ từ Note (Task bị từ chối)
- ✅ ôn thẻ: chấm Nhớ thì thẻ hết hạn ôn; chấm Quên thì hiện lại sau 10 phút
- ✅ ôn theo ngữ cảnh: thẻ của Note liên kết với việc sắp đến hạn được xếp lên đầu
- ✅ thẻ của Note trong Thùng rác không xuất hiện khi ôn
- ✅ người khác không đồng bộ, xem, ôn thẻ của mình (404) và không thấy thẻ trong danh sách ôn
- ✅ phiên học tập trung: ghi số phút, kiểm tra giới hạn, không gắn vào mục của người khác
- ✅ thống kê: số lượt ôn hôm nay, phút học, chuỗi ngày và 7 ngày gần nhất
- ✅ CSDL chặn phiên học sai dù đi đường tắt (CHECK constraint)

---

*Tài liệu tiếp theo: [11_Deployment.md](11_Deployment.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
