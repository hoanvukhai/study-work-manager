# 02 — Sổ quyết định thiết kế

> Mỗi quyết định ghi: **chọn gì — vì sao — ảnh hưởng tới đâu — hướng phát triển sau này**.
> Trạng thái: ✅ Đã chốt · 🟨 Chốt tạm (cần xác nhận lại) · ⬜ Đề xuất, chờ chốt
> Cập nhật lần cuối: 09/10/2026

---

## Tổng hợp

| Mã | Quyết định | Trạng thái |
|---|---|:-:|
| QD-01 | Bỏ Tag | ✅ |
| QD-02 | Bỏ Space lồng nhau | 🟨 |
| QD-03 | Space tự do, "tự lắp ghép công cụ" | ⬜ |
| QD-04 | Xoá Space chỉ gỡ Object ra, Object không còn Space nào thì về Hộp nhận | ⬜ |
| QD-05 | Vòng đời Object: một nguồn sự thật, chỉ đổi qua một API riêng | ⬜ |
| QD-06 | Chuyển loại Object (ví dụ Note → Task) qua thao tác riêng | ⬜ |
| QD-07 | Trường dữ liệu và luật kiểm tra theo từng loại Object | ⬜ |
| QD-08 | Bỏ luật "không tạo ở quá khứ" và "trạng thái chỉ đi theo thứ tự" | ⬜ |
| QD-09 | Liên kết: loại cố định + nhãn tuỳ chọn, có ý nghĩa với hệ thống | ⬜ |
| QD-10 | Trục chính của đề tài: "Một Object, ba góc nhìn" | ⬜ |
| QD-11 | Có Admin, nhưng Admin không xem được nội dung cá nhân | ⬜ |
| QD-12 | Thông báo: một bộ máy chung, nhiều loại, nhiều kênh | ✅ (hướng) |
| QD-13 | AI: có, làm sau cùng, chỉ gợi ý, người dùng duyệt | ✅ (hướng) |
| QD-14 | Cộng tác nhóm | ⬜ chưa quyết |
| QD-15 | Xác thực: giữ Access Token, sửa tài liệu; mật khẩu tối thiểu 8 | ⬜ |
| QD-16 | Giao diện: bộ component dùng chung + CSS Modules + TanStack Query | ⬜ |
| QD-17 | CSDL: chuyển sang migration, seed viết bằng TypeScript | ⬜ |

---

## QD-01 — Bỏ Tag ✅

**Chọn:** bỏ bảng `tags`, `object_tags` và toàn bộ FR/UC liên quan tới Tag.

**Vì sao:**
1. **Trùng chức năng.** Khi một Object đặt được vào nhiều Space thì Space đã làm đúng việc của Tag (phân loại ngang).
2. **Mâu thuẫn với chính đề tài.** PP-01 là "người dùng phải phân vân xếp vào đâu". Có cả Tag lẫn Space thì người dùng lại phải phân vân "cái này nên là Space hay Tag?".
3. Bớt 2 bảng, 1 module và nhiều FR/UC phải viết và test.

**Ảnh hưởng:** schema, doc 02 (FR-TASK-10, FR-NOTE-07/09, FR-REF-07), doc 03 (UC-09, US-16, US-24), doc 05, 06, 07, Feature Matrix.

**Hướng phát triển:** **thuộc tính tuỳ biến** — người dùng tự định nghĩa trường cho Object (ví dụ "Môn học", "Khách hàng", "Mức độ hiểu bài"), lưu trong cột `metadata` (JSONB) đã có sẵn. Cách này mạnh hơn Tag.

---

## QD-02 — Bỏ Space lồng nhau 🟨

**Chọn:** bỏ `parentId` khỏi Space. Mọi Space ngang hàng nhau.

**Vì sao:**
1. **Nghĩa không rõ khi đi cùng việc gán nhiều Space.** Object ở Space con có hiện ở Space cha không? Tiến độ Space cha có tính cả Space con không? Xoá cha thì con đi đâu? Mỗi câu là một luật mới phải thiết kế, viết tài liệu và test, mà không phục vụ 3 trụ chính.
2. **Gán nhiều Space đã đáp ứng phần lớn nhu cầu** mà phân cấp nhắm tới. Phân cấp là tư duy "thư mục" — đúng thứ đề tài muốn thoát ra.
3. **Phức tạp kỹ thuật:** chống vòng lặp (A là cha B, B là cha A), truy vấn đệ quy, kiểm tra quyền. Code hiện tại đã dính lỗi bảo mật SEC-01 và lỗi BUG-09 ở đúng chỗ này.
4. Doc 01 vốn ghi "không thực hiện" → bỏ là quay về đúng phạm vi ban đầu.

**Ảnh hưởng:** schema (bỏ `parentId`), `spaces.service.ts`, DTO, Sidebar, doc 04/05/06/07.

**Hướng phát triển:**
- **Nhóm Space trên Sidebar** — chỉ để sắp xếp hiển thị (giống thư mục bookmark), không mang ý nghĩa dữ liệu.
- **Liên kết giữa các Space** (ví dụ Space "Học NestJS" phục vụ Space "Đồ án") — dùng lại cơ chế liên kết đã có.

> Cần xác nhận: bạn đồng ý bỏ hẳn chứ?

---

## QD-03 — Space tự do, "tự lắp ghép công cụ" ⬜

**Chọn:** Space không có "loại" bắt buộc. Người dùng tự đặt tên, mô tả, icon, màu. Mỗi Space là một **bàn làm việc trống**, người dùng **tự bật những công cụ cần dùng**:

| Công cụ có thể bật | Ví dụ dùng cho |
|---|---|
| Danh sách (luôn có) | Mọi Space |
| Kanban | Đồ án, dự án freelance |
| Lịch | Môn học, đồ án |
| Mục tiêu và hạn chót của Space + thanh tiến độ | Đồ án (hạn 15/12) |
| Ôn tập (khi có trụ Học tập) | Học tiếng Nhật, môn học |
| Bản đồ liên kết (khi có trụ Tri thức) | Nghiên cứu, ghi chú kiến thức |
| Thống kê thời gian (khi có Pomodoro) | Tự học |

- **Mẫu có sẵn** (template) chỉ là bộ công cụ gợi ý cho nhanh, ví dụ "Môn học" = Danh sách + Lịch + Ôn tập. Có thể bỏ qua và bắt đầu từ bàn trống.
- Lưu cấu hình trong một cột `settings` (JSON) của Space, không cần thêm bảng.

**Vì sao:** vẫn **tự do** như bạn muốn, mà trả lời được câu hỏi "Space khác Tag ở đâu": Tag chỉ là cái nhãn; Space là bàn làm việc có bố cục, công cụ, mục tiêu, tiến độ, thứ tự và ghim riêng.

**Ảnh hưởng:** schema Space (thêm `settings`, `goal`, `dueDate`), trang Space, doc 05/06/08.

---

## QD-04 — Xoá Space chỉ gỡ Object ra ⬜

**Chọn:**
- **Xoá Space** = xoá Space và các bản ghi gán (`space_objects`). **Object không bị xoá.**
- Object nào không còn nằm ở Space nào thì xuất hiện ở **Hộp nhận** (Unassigned / Inbox).
- **Lưu trữ Space** = ẩn Space khỏi Sidebar; xem lại và khôi phục được ở trang "Lưu trữ".
- Hộp xác nhận ghi đúng: *"Xoá Space này? Các mục bên trong vẫn được giữ lại — mục nào không thuộc Space khác sẽ chuyển về Hộp nhận."*

**Vì sao:** đúng nguyên tắc lõi "Space không sở hữu Object". Tránh mất dữ liệu ngoài ý muốn.

**Ảnh hưởng:** sửa DOC-01 ở doc 02/03/05/07; UI-05; thêm trang Hộp nhận và trang Lưu trữ.

---

## QD-05 — Vòng đời Object: một nguồn sự thật ⬜

**Chọn:**
- Cột `lifecycle` (ACTIVE / ARCHIVED / TRASH) là **nguồn sự thật duy nhất**.
- `archivedAt`, `deletedAt` chỉ ghi lại **thời điểm** chuyển trạng thái.
- **Chỉ** API `PATCH /objects/:id/lifecycle` được đổi vòng đời. API sửa thường không nhận `lifecycle` nữa (sửa BUG-06).
- Luồng: ACTIVE ⇄ ARCHIVED; ACTIVE/ARCHIVED → TRASH → (khôi phục về trạng thái trước, hoặc xoá vĩnh viễn).
- (Tuỳ chọn) Thùng rác tự dọn mục quá 30 ngày, có thông báo trước.
- Space cũng đổi `isArchived` thành `archivedAt` cho đồng bộ.

**Vì sao:** tránh trạng thái mâu thuẫn; dễ test; dễ giải thích bằng sơ đồ trạng thái.

---

## QD-06 — Chuyển loại Object qua thao tác riêng ⬜

**Chọn:** không cho đổi `type` qua API sửa thường. Thay bằng thao tác **"Chuyển thành…"**, ví dụ:
- Note "Ý tưởng làm chức năng X" → **Chuyển thành Task** (giữ tiêu đề, nội dung, Space, liên kết; thêm trạng thái TODO).
- Task → Note: bỏ trạng thái và hạn chót, có hỏi xác nhận.

**Vì sao:** "biến ghi chú thành việc cần làm" là thao tác rất hay dùng, và chỉ làm được nhờ mọi thứ là cùng một loại Object. Đây là một ví dụ nữa để bảo vệ kiến trúc.

---

## QD-07 — Trường dữ liệu và luật theo từng loại ⬜

| Trường | TASK | NOTE | EVENT | REFERENCE |
|---|:-:|:-:|:-:|:-:|
| `status` | bắt buộc (mặc định TODO) | rỗng | rỗng | rỗng |
| `priority` | có | rỗng | có | rỗng |
| `dueDate` | tuỳ chọn | rỗng | rỗng | rỗng |
| `startAt` / `endAt` | rỗng | rỗng | **bắt buộc**, `endAt > startAt` | rỗng |
| `url` | rỗng | rỗng | rỗng | **bắt buộc**, đúng định dạng URL |

- `status` và `priority` chuyển thành **cho phép rỗng** trong CSDL.
- Thêm ràng buộc `CHECK` theo `type` bằng SQL trong migration (Prisma không tự sinh được CHECK).
- Trả lời được câu hỏi "Note có trạng thái TODO là sao?" → không còn nữa.

**Ghi vào Decision Log (doc 04):** so sánh 3 cách lưu nhiều loại dữ liệu:
- **Một bảng chung** (đang dùng): truy vấn liên loại đơn giản (lịch, liên kết, tìm kiếm); đổi lại có cột rỗng.
- **Bảng chung + bảng con theo loại:** gọn hơn về dữ liệu, nhưng truy vấn phải nối bảng nhiều.
- **Lưu hết vào JSON:** linh hoạt nhưng khó kiểm tra dữ liệu.

Lý do chọn: các tính năng chính đều **đi xuyên qua nhiều loại** (lịch gộp Task + Event, liên kết Note ↔ Task, chuyển Note → Task), nên một bảng chung là phù hợp nhất.

---

## QD-08 — Bỏ hai luật không thực tế ⬜

- **Bỏ** "hạn chót / sự kiện không được ở quá khứ khi tạo". Người dùng cần ghi lại buổi họp vừa diễn ra (biên bản), hoặc việc đã trễ. Thay bằng **cảnh báo nhẹ** trên giao diện, không chặn.
- **Bỏ** "trạng thái chỉ đi Todo → Doing → Done". Kanban kéo thả và nút tick Done đều đi tắt; có thêm `CANCELLED`. Cho chuyển tự do, trừ luật phụ thuộc ở QD-09.

---

## QD-09 — Liên kết có ý nghĩa với hệ thống ⬜

**Chọn:** giữ 4 loại cố định, thêm **nhãn tuỳ chọn** (chữ tự do) để người dùng ghi chú thêm.

| Loại | Hiểu đơn giản | Hệ thống làm gì với nó |
|---|---|---|
| `RELATES_TO` | Liên quan | Chỉ hiển thị, có trong bản đồ |
| `REFERENCES` | Tham khảo tài liệu/ghi chú | Hiển thị "tài liệu cần cho việc này" |
| `DEPENDS_ON` | Phải xong cái kia trước | Khoá 🔒 việc bị chặn; **cấm nối vòng tròn**; báo khi được mở khoá (trụ Kế hoạch) |
| `PARENT_OF` | Việc lớn chứa việc con | Việc con = checklist; tiến độ việc cha tự tính (thay FR-TASK-12) |

- `DEPENDS_ON` và `PARENT_OF` chỉ cho phép giữa các Task (và Event với `DEPENDS_ON`).
- Không cho liên kết với Object đang ở Thùng rác.
- Gọi đúng tên: một bản ghi có hướng, **hiển thị được cả hai chiều** (backlink) — không nói là "liên kết hai chiều" để tránh bị bắt bẻ.

---

## QD-10 — Trục chính: "Một Object, ba góc nhìn" ⬜

Cùng một tập thẻ (Task / Note / Event / Reference) và các dây nối giữa chúng, hệ thống đọc theo 3 cách:

| Góc nhìn | Đọc gì | Giúp gì |
|---|---|---|
| **Kế hoạch** | Dây "phải làm trước", hạn chót, độ ưu tiên | Biết việc nào bị chặn, việc nào làm được ngay, hôm nay nên làm gì |
| **Học tập** | Ghi chú được đánh dấu "cần nhớ" | Tự xếp lịch ôn đúng lúc sắp quên; lượt ôn hiện trong Lịch và bản tin |
| **Tri thức** | Tất cả các dây nối | Bản đồ kiến thức, backlink |

**Câu trả lời cho "khác Notion/Todoist ở đâu?":** bình thường phải dùng 3 app (Todoist, Anki, Obsidian) không nói chuyện được với nhau. Ở đây việc, ghi chú, sự kiện là **cùng một loại thẻ** nên hệ thống kết hợp được, ví dụ: *"Sắp phải làm module Auth → nhắc ôn ghi chú JWT trước."*

**Định vị trung thực (sửa DOC-14):** "Lấy cảm hứng từ Capacities, Tana, Obsidian; đơn giản hoá cho sinh viên; ràng buộc dữ liệu chặt; kết hợp lập kế hoạch và ôn tập trên cùng một mô hình dữ liệu."

---

## QD-11 — Admin ⬜

**Chọn:** thêm vai trò `ADMIN`. Admin quản lý **hệ thống**, không quản lý **nội dung** của người dùng.

| Admin được làm | Admin **không** được làm |
|---|---|
| Xem danh sách tài khoản (tên, email, ngày tạo, lần đăng nhập cuối, số lượng Object) | Đọc tiêu đề / nội dung Task, Note, Space của người dùng |
| Khoá / mở khoá tài khoản | Sửa dữ liệu của người dùng |
| Xem thống kê tổng hợp (số người dùng, số Object theo loại, hoạt động theo ngày) | |
| Gửi **thông báo hệ thống** tới mọi người (dùng lại bộ máy thông báo QD-12) | |
| Quản lý **mẫu Space** dùng chung (QD-03) | |

**Vì sao:** hội đồng thường hỏi "Admin đâu?". Nguyên tắc "admin không đọc dữ liệu cá nhân" là một điểm cộng về quyền riêng tư, nói được khi bảo vệ.

**Ảnh hưởng:** `User` thêm `role`, `lockedAt`, `lastLoginAt`; guard kiểm tra vai trò; khu vực `/admin` trên giao diện; doc 02/03 thêm Actor "Quản trị viên".

---

## QD-12 — Bộ máy thông báo chung ✅ (hướng)

```
Có chuyện xảy ra  →  Bộ máy tra cài đặt của người dùng  →  Gửi qua đúng kênh
(sắp hạn, quá hạn,      (loại nào bật, kênh nào,              (trong app, trình duyệt,
 đến lượt ôn, được       giờ yên lặng 23h–7h)                  email, Google Calendar,
 mở khoá, bản tin...)                                           Telegram...)
```

- Bảng `notifications` thêm `type` (loại), `data` (đường dẫn tới mục liên quan), `dedupeKey` (chống báo trùng).
- Thêm bảng cài đặt thông báo theo người dùng (loại × kênh × bật/tắt).
- **Làm trước:** kênh trong app + nhắc hạn/quá hạn + bản tin buổi sáng. Các loại và kênh khác thêm dần theo từng trụ.

---

## QD-13 — AI ✅ (hướng)

- Có dùng, nhưng **làm sau cùng**, khi phần lõi và các trụ đã chạy.
- AI chỉ **gợi ý**, người dùng **duyệt** trước khi lưu.
- Có nút tắt AI; ghi rõ dữ liệu nào được gửi đi.
- Ưu tiên: tạo thẻ ôn từ ghi chú → gõ câu thường thành việc → tóm tắt tuần.

---

## QD-14 — Cộng tác nhóm ⬜ chưa quyết

Cần chọn một trong ba mức:
- **(a) Không làm**, đưa vào hướng phát triển.
- **(b) Mức đơn giản:** chia sẻ Space (xem/sửa), giao việc, bình luận, lịch sử hoạt động.
- **(c) Mức đầy đủ:** thêm cập nhật tức thì, xử lý hai người sửa cùng lúc.

**Vấn đề khó riêng của đề tài:** một Object nằm ở nhiều Space. Nếu nó ở cả Space nhóm và Space riêng, thì thành viên nhóm có thấy liên kết của nó tới các mục riêng tư không? Ai được xoá nó? → Cần thiết kế luật riêng nếu làm.

---

## QD-15 — Xác thực ⬜

- Giữ **Access Token** như hiện tại; sửa README và doc 10/11 bỏ chữ "Refresh Token" (hoặc làm thật ở giai đoạn sau).
- Mật khẩu tối thiểu **8 ký tự** (theo tài liệu).
- Bỏ giá trị dự phòng của `JWT_SECRET`: thiếu biến môi trường thì app báo lỗi và dừng.

---

## QD-16 — Cách làm giao diện ⬜

- Tạo **bộ component dùng chung**: Button, Input, Select, Hộp thoại, Hộp xác nhận, Thông báo nhỏ (toast) có Hoàn tác, Badge, Menu, Tabs, Trạng thái rỗng, Khung đang tải.
- Viết style bằng **CSS Modules** + biến màu (đúng như doc 04/09 đã ghi); hỗ trợ sáng/tối.
- Dùng **TanStack Query** để gọi API: tự lưu tạm và tự làm mới dữ liệu → hết cảnh phải tải lại trang (TECH-07).
- Chuyển dần style cũ sang mới **khi đụng tới màn hình nào thì sửa màn đó**, không viết lại hết một lần.

---

## QD-17 — Cơ sở dữ liệu ⬜

- Chuyển từ `db push` sang **`prisma migrate`**: mỗi thay đổi CSDL là một file migration có tên rõ ràng → truy vết được, dễ deploy.
- Seed viết bằng `seed.ts` với mật khẩu băm thật; có sẵn 1 tài khoản demo và 1 tài khoản admin.
- Thêm các index còn thiếu (TECH-09).
