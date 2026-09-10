# 01 — Khảo sát & Xác định bài toán

> Tài liệu trước: Tài liệu đầu tiên
> Tài liệu sau: [02_Requirement.md](02_Requirement.md)

---

## 1. Bối cảnh

Nhu cầu quản lý công việc, học tập, lịch trình và lưu trữ thông tin cá nhân hiện nay là rất lớn. Tuy nhiên các công cụ hỗ trợ lại quá đa dạng và không thống nhất — mỗi phần mềm chỉ tập trung giải quyết một nhu cầu riêng lẻ, đồng thời buộc người dùng phải phân loại thông tin vào những danh mục cố định được thiết kế sẵn.

Trên thực tế, nhiều công việc không nằm gọn trong một danh mục duy nhất. Một đồ án tốt nghiệp vừa là học tập vừa là công việc phải hoàn thành với deadline cụ thể. Một dự án freelance vừa cần quản lý tiến độ vừa cần lưu trữ tài liệu trao đổi với khách hàng. Việc bị ép phân loại ngay từ đầu khiến người dùng phải ghi trùng thông tin ở nhiều nơi, hoặc đặt thông tin vào chỗ không phù hợp.

Bên cạnh đó, việc sử dụng nhiều phần mềm riêng lẻ khiến thông tin bị phân tán, người dùng phải chuyển đổi qua lại giữa nhiều ứng dụng và khó có cái nhìn tổng quan về những việc cần hoàn thành.

Từ thực tế đó, đề tài hướng đến việc xây dựng ứng dụng web quản lý cá nhân, cho phép người dùng tự tạo các không gian (**Space**) theo đúng chủ đề của riêng mình và quản lý tập trung công việc, lịch trình, ghi chú và tài liệu trong cùng một nơi, giúp việc theo dõi tiến độ và quản lý thông tin trở nên thuận tiện hơn.

---

## 2. Các công cụ hiện có

| Nhóm công cụ      | Ví dụ                              | Điểm mạnh                                  | Hạn chế                                                                                   | Ý tưởng                             |
| ----------------- | ---------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------- |
| Quản lý công việc | Todoist, Trello, TickTick          | Quản lý Task nhanh, nhắc nhở tốt           | Thiếu ghi chú, không liên kết với tài liệu học tập                                       | Deadline + Notification             |
| Quản lý lịch      | Google Calendar                    | Xem lịch, đặt lịch nhắc                   | Không gắn được với nội dung công việc hoặc tài liệu cụ thể                               | Calendar là cách xem, không phải nơi lưu dữ liệu |
| Ghi chú           | Notion, Obsidian                   | Rất linh hoạt, người dùng tự tổ chức không gian riêng | Không có cấu trúc Task/Event với ràng buộc dữ liệu thật — phải tự dựng từ block trống   | Space tự tạo + cấu trúc dữ liệu rõ ràng |
| Lưu trữ           | Google Drive                       | Lưu file, chia sẻ dễ dàng                 | Không liên kết tài liệu với deadline hay công việc cụ thể                                | Reference gắn vào đúng chủ đề       |
| Bookmark          | Padlet, Raindrop                   | Lưu link dạng thẻ trực quan               | Không quản lý tiến độ, không liên kết với công việc                                      | Note Card                           |
| Learning          | Moodle, Google Classroom, Coursera | Lộ trình học tập có cấu trúc              | Chỉ phục vụ môi trường học, không dùng được cho công việc cá nhân                        | —                                   |

Mỗi phần mềm trên đều có ưu điểm riêng nhưng chỉ tập trung giải quyết các vấn đề cụ thể. Khi sử dụng nhiều phần mềm cùng lúc, thông tin dễ bị phân tán, người dùng phải chuyển đổi qua lại và khó có cái nhìn tổng quan. Đây là vấn đề mà đề tài hướng đến giải quyết.

---

## 3. Người dùng mục tiêu

Đề tài hướng đến nhóm người dùng trẻ có công việc chính xoay quanh xử lý thông tin và tri thức, bao gồm:

- Học sinh, sinh viên và người tự học: quản lý đồ án, bài tập, lịch học, tài liệu tham khảo và kế hoạch ôn tập cùng một lúc.
- Freelancer và người lao động tri thức: quản lý nhiều dự án song song với deadline và tài liệu riêng cho từng khách hàng.
- Người tự học: theo dõi tiến độ nhiều khoá học cùng lúc, gắn ghi chú bài học với lịch học cụ thể.

Điểm chung của các nhóm này là thường xuyên phải dùng nhiều công cụ khác nhau chỉ để quản lý một chủ đề duy nhất, và không có công cụ nào cho phép họ tự tổ chức thông tin theo đúng cách họ nghĩ — mà phải cố ép thông tin vào khuôn phân loại có sẵn của ứng dụng.

Hệ thống tập trung phục vụ người dùng cá nhân, không hướng đến các doanh nghiệp hoặc tổ chức có quy trình quản lý phức tạp.

---
## 4. Personas

Giả định 3 người dùng đại diện:

### Persona 1

#### Nam – 21 tuổi

> "Tôi chỉ muốn mở một trang là biết hôm nay phải học gì và làm gì — chứ không muốn phân vân cái này nên để ở Học tập hay Công việc."

**Nghề nghiệp:** Sinh viên năm cuối ngành Công nghệ thông tin, đồng thời thực tập tại doanh nghiệp.

**Bối cảnh**

Nam đang làm đồ án tốt nghiệp, học thêm tiếng Nhật buổi tối và theo dõi vài khoá học kỹ năng online. Mã nguồn đồ án để trên GitHub, tài liệu lưu trên Google Drive, lịch học ghi trên Google Calendar — ba nơi, ba ứng dụng khác nhau.

**Mục tiêu**

- Không bỏ quên deadline nộp báo cáo hay lịch họp với giảng viên hướng dẫn.
- Quản lý tài liệu liên quan đến đồ án theo từng giai đoạn.
- Theo dõi được tiến độ học và làm trên cùng một nơi.

**Khó khăn**

- Khi tạo một việc liên quan đến đồ án (vừa phải học kiến thức mới, vừa phải hoàn thành sản phẩm), không biết xếp vào "Học tập" hay "Công việc" — nhiều lúc ghi trùng cả hai nơi.
- Tài liệu nằm rải rác GitHub và Drive, mỗi lần cần phải mở nhiều tab để tìm.

**Kỳ vọng**

Có một không gian riêng cho đồ án tốt nghiệp — chứa cả task code, ghi chú kiến trúc, lịch họp giảng viên, link tài liệu — không cần phân vân nó thuộc "Học" hay "Việc".

---

### Persona 2

#### Linh – 24 tuổi

> "Mỗi dự án đều có tài liệu riêng, tôi chỉ muốn tìm mọi thứ trong vài giây."

**Nghề nghiệp:** Freelancer thiết kế đồ hoạ.

**Bối cảnh**

Linh nhận dự án thiết kế và lập trình cho nhiều khách hàng cùng lúc. Feedback của khách nằm rải rác trên email, Zalo và file thiết kế trên Drive — không được tổng hợp ở một nơi.

**Mục tiêu**

- Theo dõi deadline từng dự án mà không bị nhầm lẫn giữa các khách hàng.
- Lưu trữ tài liệu và ghi chú trao đổi theo đúng từng dự án.
- Giảm thời gian tìm kiếm thông tin khi cần giao sản phẩm.

**Khó khăn**

- Deadline của nhiều dự án dễ chồng chéo, khó theo dõi cái nào cần giao trước.
- Tài liệu và feedback của khách bị thất lạc giữa nhiều kênh liên lạc.
- Khó kiểm soát tổng thể khi số lượng dự án tăng lên.

**Kỳ vọng**

Mỗi khách hàng có một không gian riêng — task cần giao, ghi chú trao đổi, file thiết kế — tách biệt rõ ràng, không lẫn lộn giữa các dự án.

---

### Persona 3

#### Huy – 26 tuổi

> "Đi làm cả ngày rồi, tối tôi chỉ muốn học mà không phải mất thời gian sắp xếp lại mọi thứ."

**Nghề nghiệp:** Nhân viên văn phòng.

**Bối cảnh**

Ban ngày Huy làm việc toàn thời gian, buổi tối tự học thêm lập trình và ngoại ngữ qua khoá học online. Ghi chú rải rác trên nhiều app note khác nhau, không theo dõi được mình đã học đến đâu.

**Mục tiêu**

- Theo dõi tiến độ từng khoá học đang học.
- Gắn ghi chú bài học với lịch học cụ thể.
- Phân bổ thời gian hợp lý giữa các khoá học.

**Khó khăn**

- Không theo dõi được mình đã học tới đâu trong mỗi khoá.
- Ghi chú và tài liệu tham khảo của từng bài học không gắn với lịch học.
- Dễ bỏ dở kế hoạch học tập khi bận việc.

**Kỳ vọng**

Mỗi khoá học có một không gian riêng — ghi chú bài học, task luyện tập, link tài liệu khoá học — theo dõi trong cùng một nơi.

---

## 5. Vấn đề cụ thể (Pain Points)

| ID    | Vấn đề                                                                                                                                                                      |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PP-01 | Bị ép phân loại thông tin vào những danh mục cố định (phải quyết định "đây là Học hay Việc" ngay khi tạo), dù nhiều việc thực tế không nằm gọn trong một danh mục duy nhất. |
| PP-02 | Phải thường xuyên chuyển đổi qua lại giữa nhiều ứng dụng để tổng hợp thông tin về cùng một chủ đề, làm mất thời gian và giảm sự tập trung.                                  |
| PP-03 | Khó theo dõi tổng quan tiến độ khi lịch trình, công việc, ghi chú và tài liệu không được liên kết với nhau trong cùng một chỗ.                                              |
| PP-04 | Dễ bỏ sót deadline vì thông báo, thời hạn và nội dung liên quan nằm rải rác trên các nền tảng khác nhau.                                                                    |
| PP-05 | Tài liệu tham khảo lưu dưới dạng link rời rạc, không gắn với công việc hay nội dung cụ thể, khó tìm lại khi cần.                                                            |
| PP-06 | Chưa có hệ thống nào cho phép người dùng tự tổ chức không gian quản lý theo chủ đề riêng của mình mà không bị giới hạn bởi các danh mục cố định.                            |

**Kết luận**
> Từ các vấn đề ở trên có thể thấy, nguyên nhân chủ yếu không nằm ở việc thiếu công cụ mà là ở sự phân tán giữa nhiều nền tảng riêng lẻ và sự gò bó của các danh mục phân loại cố định. Vì vậy, cần có một hệ thống cho phép người dùng tự tạo không gian quản lý theo chủ đề riêng, đồng thời vẫn đảm bảo dữ liệu được kiểm soát chặt chẽ ở tầng hệ thống.

---

## 6. Phát biểu bài toán

Qua quá trình khảo sát và phân tích, có thể thấy người dùng thường xuyên phải sử dụng nhiều phần mềm khác nhau để quản lý công việc, học tập, lịch biểu và tài liệu tham khảo. Hầu hết các công cụ hiện có đều buộc người dùng phân loại thông tin theo những danh mục được thiết kế sẵn, trong khi trên thực tế nhiều công việc, dự án hay mối quan tâm cá nhân không nằm gọn trong một danh mục duy nhất. Điều này khiến người dùng phải ghi trùng thông tin ở nhiều nơi, mất thời gian tìm kiếm và khó có cái nhìn tổng quan.

Bên cạnh đó, ngay cả khi người dùng tự tạo được không gian quản lý theo chủ đề riêng, mỗi nội dung vẫn thường bị giới hạn trong một không gian duy nhất. Một ghi chú về JWT có thể liên quan đến cả dự án đồ án lẫn khoá học NestJS đang theo — nhưng hầu hết công cụ không cho phép nó xuất hiện ở cả hai nơi mà không cần sao chép.

Từ thực tế đó, đề tài hướng đến việc xây dựng ứng dụng web quản lý cá nhân, trong đó mỗi nội dung (Task, Note, Event, Reference) tồn tại như một **đối tượng độc lập (Object)** thuộc về người dùng — có thể được đặt vào một hoặc nhiều **Không gian (Space)** tuỳ theo ngữ cảnh, liên kết với các đối tượng khác, và có vòng đời riêng (lưu trữ, xoá tạm, xoá vĩnh viễn). Hệ thống hướng đến việc giảm sự phân tán thông tin, giúp người dùng tổ chức và theo dõi công việc theo đúng cách họ nghĩ mà không bị ép vào khuôn có sẵn.

---

## 7. Mục tiêu (Objectives)

Dựa trên các vấn đề đã nêu, hệ thống cần có:

| ID         | Mục tiêu                                                                                                                                          | Giải quyết vấn đề |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **OBJ-01** | Cho phép người dùng tự tạo Space theo chủ đề riêng, không giới hạn bởi khái niệm Học tập hay Công việc cố định.                                  | PP-01, PP-06      |
| **OBJ-02** | Cho phép tạo và quản lý 4 loại nội dung: Task (công việc), Note (ghi chú), Event (sự kiện), Reference (tài liệu) — mỗi loại tồn tại độc lập với Space. | PP-02, PP-03      |
| **OBJ-03** | Cho phép đặt một nội dung vào nhiều Space khác nhau tuỳ theo ngữ cảnh, không cần sao chép dữ liệu.                                               | PP-01, PP-03      |
| **OBJ-04** | Cho phép liên kết các nội dung với nhau (Relation) để thể hiện mối quan hệ ngữ nghĩa giữa chúng.                                                 | PP-03, PP-05      |
| **OBJ-05** | Cung cấp nhiều góc nhìn (View) trên cùng một tập dữ liệu: Calendar View, List View, Board View (Kanban).                                         | PP-02, PP-03      |
| **OBJ-06** | Cung cấp Dashboard tổng quan giúp người dùng theo dõi Task và Event sắp đến hạn trên toàn bộ Space.                                              | PP-03, PP-04      |
| **OBJ-07** | Hỗ trợ nhắc nhở tự động các Task và Event sắp đến hạn nhằm giảm tình trạng bỏ sót deadline.                                                      | PP-04             |

---

## 8. Phạm vi

### Thực hiện

Đề tài tập trung xây dựng ứng dụng web hỗ trợ người dùng cá nhân tự tổ chức thông tin của mình, bao gồm các chức năng chính:

- Quản lý tài khoản và xác thực người dùng (Authentication).
- Space do người dùng tự tạo, tự đặt tên để phân nhóm nội dung theo chủ đề riêng.
- 4 loại nội dung (Object): Task (có deadline và trạng thái), Note (ghi chú văn bản/markdown), Event (sự kiện có thời gian), Reference (liên kết tài liệu tham khảo).
- Mỗi Object tồn tại độc lập và có thể được đặt vào một hoặc nhiều Space tuỳ theo ngữ cảnh.
- Relation liên kết giữa các Object với nhãn do người dùng tự đặt.
- Vòng đời Object: active → archived → trash → xoá vĩnh viễn.
- View: Calendar (theo thời gian), List, Board (Kanban theo trạng thái Task).
- Dashboard tổng quan Task và Event sắp đến hạn.
- Hệ thống thông báo, nhắc nhở Task và Event sắp đến hạn.

### Không thực hiện

Trong phạm vi đồ án, hệ thống không tập trung phát triển các chức năng sau:

- Làm việc nhóm hoặc cộng tác nhiều người trên cùng một Space.
- Phân quyền nhiều cấp hoặc quản lý theo mô hình doanh nghiệp, tổ chức.
- Phát triển ứng dụng di động dạng native (Android hoặc iOS).
- Tích hợp thanh toán, thương mại điện tử hoặc các dịch vụ tài chính.
- Đồng bộ dữ liệu trực tiếp với các nền tảng bên thứ ba như Google Calendar, Google Drive hay Notion (nếu có chỉ dừng ở mức lưu liên kết).
- Space chứa Space lồng nhau (nested Space) — cấu trúc phân cấp Space để nghiên cứu ở phiên bản sau.
- Trình soạn thảo dạng block lồng nhau tự do kiểu Notion — Note trong đề tài này là văn bản và markdown đơn giản.

---

*Tiếp theo: [02_Requirement.md](02_Requirement.md) — chuyển các vấn đề ở trên thành danh sách yêu cầu cụ thể*
*Quay lại mục lục: [docs/README.md](README.md)*
