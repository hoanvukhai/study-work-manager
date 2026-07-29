# 01 — Khảo sát & Xác định bài toán

> Tài liệu trước: Tài liệu đầu tiên
> Tài liệu sau: [02_Requirement.md](02_Requirement.md)  

---

## 1. Bối cảnh

Nhu cầu ghi chú, quản lý lịch trình, công việc và lưu trữ thông tin phục vụ học tập lẫn cuộc sống hiện nay là rất lớn. Tuy nhiên, các công cụ lại quá đa dạng và không thống nhất. Mỗi phần mềm lại tập trung vào các vấn đề riêng biệt khiến người dùng phải sử dụng đồng thời nhiều phần mềm trên cả máy tính lẫn điện thoại chỉ để đáp ứng nhu cầu học tập và công việc của mình.

Việc sử dụng nhiều phần mềm gây ra nhiều bất tiện trong quá trình học tập và làm việc. Người dùng gặp khó khăn trong việc tìm kiếm và quản lý thông tin cũng như phải chuyển đổi qua lại giữa các phần mềm hoặc tab trình duyệt. Bên cạnh đó, việc sử dụng nhiều phần mềm gây ra tình trạng thông tin bị phân tán, rời rạc, trùng lặp hoặc bỏ sót. Đồng thời, việc thiếu một giao diện tổng quan cũng khiến người dùng khó theo dõi tiến độ và sắp xếp các công việc cần ưu tiên.

Từ thực tế đó, đề tài hướng đến việc xây dựng phần mềm quản lý học tập và quản lý công việc cá nhân trên nền tảng web. Phần mềm cho phép người dùng quản lý tập trung các công việc, lịch trình, tài liệu tham khảo và nội dung học tập trong cùng một hệ thống, giúp việc theo dõi và quản lý thông tin trở nên tiện lợi hơn. Người dùng chỉ cần truy cập vào một địa chỉ duy nhất trên trình duyệt là có thể nắm bắt các công việc, lịch trình và thông tin cần thiết trong ngày, từ đó giảm bớt sự phân tán thông tin và hạn chế việc phải chuyển đổi giữa nhiều phần mềm.


---

## 2. Các công cụ hiện có

| Nhóm công cụ      | Ví dụ                              | Điểm mạnh          | Hạn chế                | **Ý tưởng**                  |
| ----------------- | ---------------------------------- | ------------------ | ---------------------- | ---------------------------- |
| Quản lý công việc | Todoist, Trello, TickTick          | Quản lý Task nhanh | Thiếu học tập          | Quick Add, Kanban            |
| Quản lý lịch      | Google Calendar                    | Lập lịch           | Không liên kết Task    | Dashboard Today              |
| Ghi chú           | Notion, Obsidian                   | Lưu tri thức       | Thiếu nhắc việc        | Reference + Markdown         |
| Lưu trữ           | Google Drive                       | Lưu file           | Không gắn Task         | Reference Link               |
| Bookmark          | Padlet, Raindrop                   | Card View          | Không quản lý tiến độ  | Reference Card               |
| Learning          | Moodle, Google Classroom, Coursera | Lộ trình học       | Chỉ phục vụ học        | Learning Module              |
| Whiteboard        | Miro, FigJam                       | Brainstorm         | Không theo dõi tiến độ | Tree View / Learning Roadmap |

Mỗi phần mềm trên đều có ưu điểm riêng nhưng chỉ tập trung giải quyết các vấn đề cụ thể. Nhưng khi sử dụng nhiều phần mềm với nhau thì thông tin dễ bị phân tán, người dùng phải chuyển đổi qua lại giữa các phần mềm với nhau và khó có được cái nhìn tổng quan. Đây là một vấn đề mà đề tài hướng tới để giải quyết bằng một nền tảng quản lý thống nhất. 

## 3. Người dùng mục tiêu

Đề tài hướng đến nhóm người dùng có nhu cầu quản lý đồng thời việc học tập và công việc cá nhân, bao gồm:

- Học sinh, sinh viên và người tự học: Quản lý môn học, bài tập, lịch học, tài liệu tham khảo, kế hoạch ôn tập và theo dõi tiến độ học tập.
- Freelancer và người lao động tri thức trẻ: Quản lý công việc cá nhân, lịch trình, tài liệu liên quan và các dự án cá nhân trên cùng một hệ thống.

Điểm chung của các nhóm người dùng này là thường xuyên phải sử dụng nhiều công cụ khác nhau như phần mềm quản lý công việc, lịch, ghi chú và lưu trữ tài liệu. Việc dữ liệu nằm rải rác trên nhiều nền tảng khiến họ mất nhiều thời gian tìm kiếm thông tin, khó theo dõi tiến độ và dễ bỏ sót những công việc quan trọng.

Vì vậy, hệ thống được xây dựng nhằm hỗ trợ người dùng quản lý tập trung việc học tập, công việc, lịch biểu và tài liệu tham khảo trên một ứng dụng web duy nhất, góp phần giảm sự phân tán thông tin và giúp việc theo dõi tiến độ trở nên thuận tiện hơn.

Hệ thống tập trung phục vụ người dùng cá nhân, không hướng đến các doanh nghiệp hoặc tổ chức có quy trình quản lý phức tạp. Thiết kế của hệ thống ưu tiên sự đơn giản, dễ sử dụng và linh hoạt, phù hợp với những người vừa học tập, vừa làm việc hoặc thường xuyên tự quản lý nhiều mục tiêu cùng lúc.

---
## 4. Personas

Giả định 3 người dùng đại diện:
### Persona 1

#### Nam – 21 tuổi

> "Tôi chỉ muốn mở một trang là biết hôm nay phải học gì và làm gì."

**Nghề nghiệp:** Sinh viên năm cuối và là thực tập sinh.

**Bối cảnh**

Nam đang học năm cuối đại học, đồng thời thực tập tại doanh nghiệp và hoàn thành đồ án tốt nghiệp. Ngoài ra, Nam còn tự học thêm ngoại ngữ và các chứng chỉ chuyên ngành nên mỗi ngày phải theo dõi nhiều đầu việc khác nhau.

**Mục tiêu**

- Không bỏ quên deadline học tập và công việc.
- Quản lý tài liệu theo từng môn học hoặc dự án.
- Theo dõi được tiến độ học tập và công việc trên cùng một hệ thống.

**Khó khăn**

- Tài liệu, lịch học và công việc được lưu trên nhiều phần mềm khác nhau.
- Mất thời gian tìm kiếm thông tin khi cần.
- Khó có cái nhìn tổng quan về những việc cần hoàn thành trong ngày.

**Kỳ vọng**

Có một hệ thống giúp tập trung lịch học, công việc, tài liệu và các nhiệm vụ cần làm để chỉ cần mở một nơi là biết mình cần làm gì.

---
### Persona 2

#### Linh – 24 tuổi

> "Mỗi dự án đều có tài liệu riêng, tôi chỉ muốn tìm mọi thứ trong vài giây."

**Nghề nghiệp:** Freelancer thiết kế đồ họa.

**Bối cảnh**

Linh nhận nhiều dự án cùng lúc từ các khách hàng khác nhau. Ngoài công việc chính, Linh thường xuyên học thêm các kỹ năng mới để nâng cao chuyên môn.

**Mục tiêu**

- Theo dõi tiến độ từng dự án.
- Lưu trữ tài liệu và liên kết tham khảo theo từng công việc.
- Giảm thời gian tìm kiếm thông tin.

**Khó khăn**

- Deadline của nhiều dự án dễ bị chồng chéo.
- Link tài liệu, hình ảnh và ghi chú nằm rải rác ở nhiều nơi.
- Khó kiểm soát toàn bộ công việc khi số lượng dự án tăng lên.

**Kỳ vọng**

Có một không gian làm việc tập trung để quản lý tiến độ, lịch trình và tài liệu của từng dự án một cách trực quan.

---
### Persona 3

#### Huy – 26 tuổi

> "Đi làm cả ngày rồi, tối tôi chỉ muốn học mà không phải mất thời gian sắp xếp lại mọi thứ."

**Nghề nghiệp:** Nhân viên văn phòng.

**Bối cảnh**

Ban ngày Huy làm việc toàn thời gian, buổi tối dành thời gian học lập trình và ngoại ngữ để chuyển hướng nghề nghiệp. Huy phải cân bằng giữa công việc hiện tại và các mục tiêu phát triển bản thân.

**Mục tiêu**

- Duy trì đều đặn việc học sau giờ làm.
- Xây dựng lộ trình học tập rõ ràng.
- Phân bổ thời gian hợp lý giữa công việc và học tập.

**Khó khăn**

- Dễ bỏ dở kế hoạch học tập vì bận công việc.
- Khó theo dõi tiến độ dài hạn.
- Tài liệu học tập và ghi chú không liên kết với lịch hoặc công việc cụ thể.

**Kỳ vọng**

Có một hệ thống giúp quản lý riêng phần học tập và công việc nhưng vẫn hiển thị tổng quan trên cùng một bảng điều khiển.

---

## 5. Vấn đề cụ thể (Pain Points)

| ID    | Vấn đề                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| PP-01 | Thông tin học tập, công việc và tài liệu được lưu trữ trên nhiều phần mềm khác nhau, gây phân tán dữ liệu và khó quản lý.                  |
| PP-02 | Phải thường xuyên chuyển đổi giữa nhiều phần mềm hoặc nhiều tab trình duyệt để tìm kiếm thông tin, làm giảm sự tập trung và mất thời gian. |
| PP-03 | Khó theo dõi tổng quan tiến độ học tập và công việc khi lịch trình, nhiệm vụ và tài liệu không được liên kết với nhau.                     |
| PP-04 | Dễ bỏ sót hoặc quên các công việc quan trọng do thông báo, deadline và tài liệu liên quan nằm trên các nền tảng khác nhau.                 |
| PP-05 | Việc lưu trữ tài liệu chủ yếu dưới dạng liên kết hoặc tệp rời rạc khiến quá trình tìm kiếm và tái sử dụng thông tin gặp nhiều khó khăn.    |
| PP-06 | Chưa có một hệ thống duy nhất hỗ trợ đồng thời quản lý học tập, công việc, lịch biểu và tài liệu tham khảo theo nhu cầu cá nhân.           |
**Kết luận**
> Từ các vấn đề ở trên có thể thấy, nguyên nhân chủ yếu không nằm ở việc thiếu công cụ hỗ trợ mà là ở sự phân tán giữa nhiều nền tảng riêng lẻ. Điều này làm giảm hiệu quả quản lý, tăng thời gian tìm kiếm thông tin và gây khó khăn trong việc theo dõi tiến độ học tập cũng như công việc. Vì vậy, cần có một hệ thống quản lý tập trung giúp liên kết các thông tin liên quan và hỗ trợ người dùng quản lý thuận tiện hơn.

---

## 6. Phát biểu bài toán

Qua quá trình khảo sát và phân tích, có thể thấy người dùng thường xuyên phải sử dụng nhiều phần mềm khác nhau để quản lý công việc, học tập, lịch biểu và tài liệu tham khảo. Việc dữ liệu được lưu trữ trên nhiều phần mềm làm tăng thời gian tìm kiếm thông tin, gây khó khăn trong việc theo dõi tiến độ và dễ bỏ sót các công việc quan trọng. Mặc dù mỗi công cụ đều có những ưu điểm riêng, nhưng chưa có một giải pháp đáp ứng đồng thời nhu cầu quản lý học tập và công việc cá nhân trong một hệ thống thống nhất.

Từ thực tế đó, đề tài hướng tới việc xây dựng một ứng dụng web hỗ trợ quản lý học tập và công việc cá nhân, cho phép người dùng quản lý tập trung các công việc, lịch biểu, tài liệu tham khảo và nội dung học tập trên cùng một nền tảng. Hệ thống hướng đến việc giảm sự phân tán thông tin, hỗ trợ theo dõi tiến độ hiệu quả hơn và mang lại trải nghiệm quản lý đơn giản, thuận tiện cho người dùng cá nhân.

---

## 7. Mục tiêu (Objectives)

Dựa trên các vấn đề đã nêu, hệ thống cần có:

| ID         | Mục tiêu                                                                                                  | Giải quyết vấn đề   |
| ---------- | --------------------------------------------------------------------------------------------------------- | ------------------- |
| **OBJ-01** | Cho phép tạo, quản lý và theo dõi công việc (Task) có deadline và trạng thái thực hiện.                   | PP-03, PP-04        |
| **OBJ-02** | Xây dựng quản lý học tập riêng, hỗ trợ theo dõi lộ trình học, tiến độ và nội dung học tập.                | PP-01, PP-06        |
| **OBJ-03** | Quản lý lịch trình và liên kết lịch với các công việc hoặc hoạt động học tập liên quan.                   | PP-03, PP-04        |
| **OBJ-04** | Cho phép lưu trữ và liên kết tài liệu tham khảo với từng công việc hoặc nội dung học tập.                 | PP-01, PP-05        |
| **OBJ-05** | Cung cấp Dashboard tổng quan giúp người dùng theo dõi lịch trình, công việc và tiến độ trên một màn hình. | PP-02, PP-03, PP-06 |
| **OBJ-06** | Hỗ trợ nhắc nhở các công việc và sự kiện sắp đến hạn nhằm giảm tình trạng bỏ sót deadline.                | PP-04               |

Các mục tiêu trên được xây dựng dựa trên những vấn đề đã phân tích trước đó, hướng đến việc xây dựng một hệ thống giúp người dùng quản lý tập trung việc học tập và công việc cá nhân, đồng thời nâng cao khả năng theo dõi tiến độ, tổ chức thông tin và sử dụng thời gian hiệu quả hơn.

---

## 8. Phạm vi

### Thực hiện

Đề tài tập trung xây dựng ứng dụng web hỗ trợ người dùng cá nhân quản lý học tập và công việc, bao gồm các chức năng chính sau:

- Quản lý tài khoản và xác thực người dùng (Authentication).
- Dashboard tổng hợp lịch trình, công việc và tiến độ học tập.
- Quản lý công việc (Task) với deadline, trạng thái và mức độ ưu tiên.
- Quản lý học tập (Learning) gồm chủ đề, nội dung học tập và theo dõi tiến độ.
- Quản lý lịch biểu (Calendar) và liên kết với Task, Learning.
- Quản lý tài liệu tham khảo (Reference), cho phép liên kết tài liệu với công việc hoặc nội dung học tập.
- Hệ thống thông báo, nhắc nhở các công việc và sự kiện sắp đến hạn.

### Không thực hiện

Trong phạm vi đồ án, hệ thống không tập trung phát triển các chức năng sau:

- Làm việc nhóm hoặc cộng tác nhiều người trên cùng một công việc.
- Phân quyền nhiều cấp hoặc quản lý theo mô hình doanh nghiệp, tổ chức.
- Phát triển ứng dụng di động (Mobile Native) cho Android hoặc iOS.
- Tích hợp thanh toán, thương mại điện tử hoặc các dịch vụ tài chính.
- Đồng bộ dữ liệu trực tiếp với các nền tảng bên thứ ba như Google Calendar, Google Drive hoặc Notion (nếu có chỉ dừng ở mức lưu liên kết tài liệu).

---

*Tiếp theo: [02_Requirement.md](02_Requirement.md) - chuyển các vấn đề ở trên thành danh sách yêu cầu cụ thể*
*Quay lại mục lục: [docs/README.md](README.md)*
