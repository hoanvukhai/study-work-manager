# 01.2 — Khảo sát các giải pháp hiện có (Related Systems)

## 1. Mục tiêu khảo sát
Phần này tiến hành khảo sát các phần mềm, công cụ hiện đang được người dùng sử dụng để giải quyết các bài toán về quản lý công việc, học tập và lưu trữ. Việc khảo sát được chia theo 7 nhóm chức năng cốt lõi nhằm đánh giá khả năng đáp ứng của thị trường hiện tại, từ đó làm nổi bật tính cấp thiết của việc xây dựng một nền tảng quản lý thống nhất cho người học và lao động tri thức trẻ.

## 2. Phân tích theo nhóm chức năng

### 2.1. Nhóm Quản lý công việc (Task Management)
*   **Công cụ khảo sát:** Todoist, TickTick, Trello, ClickUp.
*   **Điểm mạnh chung:** Xử lý cực tốt luồng tác vụ (Workflow). Hỗ trợ tạo việc nhanh, nhắc nhở deadline mạnh mẽ và quản lý tiến độ trực quan thông qua bảng Kanban hoặc danh sách (List).
*   **Hạn chế chung:** Chỉ tập trung vào năng suất làm việc (Productivity), không có khái niệm chuyên biệt cho lộ trình "Học tập" (Learning) - vốn yêu cầu cấu trúc bài học và đánh giá mức độ hiểu bài.
*   **Bài học rút ra:** Hệ thống đề xuất cần tích hợp cơ chế thêm nhanh (Quick Add) và trạng thái công việc kéo-thả (Kanban) của nhóm này.

### 2.2. Nhóm Ghi chú & Quản lý tri thức (Notes & Knowledge)
*   **Công cụ khảo sát:** Notion, Obsidian, OneNote.
*   **Điểm mạnh chung:** Khả năng lưu trữ mạnh mẽ, hỗ trợ soạn thảo văn bản đa dạng (Markdown), và tổ chức dữ liệu linh hoạt.
*   **Hạn chế chung:** Cấu trúc quá linh hoạt khiến người dùng cá nhân tốn nhiều thời gian thiết lập. Thiếu tính năng nhắc việc (Reminder) nhạy bén và liên kết lịch tự động.
*   **Bài học rút ra:** Tích hợp trình soạn thảo Markdown cơ bản và khả năng liên kết dữ liệu, không đi sâu vào việc xây dựng công cụ xử lý văn bản phức tạp.

### 2.3. Nhóm Quản lý thời gian & Lịch biểu (Calendar)
*   **Công cụ khảo sát:** Google Calendar, Outlook Calendar.
*   **Điểm mạnh chung:** Trực quan hóa quỹ thời gian cá nhân tốt theo Ngày/Tuần/Tháng. Đồng bộ hóa đa nền tảng.
*   **Hạn chế chung:** Sự kiện trên lịch thường tồn tại dưới dạng văn bản tĩnh, bị tách rời khỏi bản chất của công việc (không click vào để mở ra tiến độ hay tài liệu).
*   **Bài học rút ra:** Áp dụng giao diện Lịch (Today View) làm trung tâm điều phối, cho phép liên kết trực tiếp một sự kiện với một tác vụ hoặc bài học cụ thể.

### 2.4. Nhóm Thu thập & Tổ chức tài nguyên (Reference / Bookmark)
*   **Công cụ khảo sát:** Padlet, Raindrop.io, Pocket.
*   **Điểm mạnh chung:** Biến các liên kết web (URL) thành dạng Thẻ (Rich Card) trực quan. Cho phép gom nhóm tài nguyên theo Tag hoặc Bảng (Board) sinh động.
*   **Hạn chế chung:** Là kho lưu trữ thụ động. Tài liệu dễ bị lãng quên do không gắn liền với hành động thực thi hay hạn chót.
*   **Bài học rút ra:** Biến các liên kết tài liệu thành Thẻ trực quan (Card) và đính kèm thẳng vào luồng Task/Learning để cung cấp ngữ cảnh ngay khi cần.

### 2.5. Nhóm Quản lý Học tập (Learning / LMS)
*   **Công cụ khảo sát:** Google Classroom, Moodle, Coursera.
*   **Điểm mạnh chung:** Tổ chức cấu trúc học thuật rõ ràng (Khóa học -> Đề cương -> Bài giảng). Có thanh tiến độ (Progress Bar).
*   **Hạn chế chung:** Hệ thống đóng, chủ yếu phục vụ tổ chức giáo dục. Người dùng không thể tự do quản lý các lộ trình tự học cá nhân đan xen với công việc.
*   **Bài học rút ra:** Đưa cấu trúc phân nhánh và Thanh tiến độ vào phân hệ Learning của nền tảng cá nhân.

## 3. Ma trận so sánh tính năng (Feature Comparison Matrix)

| Công cụ                |  Task / To-do  | Calendar / Lịch | Learning (Lộ trình học) | Reference (Tài nguyên) | Dashboard Tập trung |
| :--------------------- | :------------: | :-------------: | :---------------------: | :--------------------: | :-----------------: |
| **Todoist / TickTick** |     ✅ Tốt      |     ⚠️ Yếu      |         ❌ Không         |        ❌ Không         |       ❌ Không       |
| **Google Calendar**    |    ❌ Không     |      ✅ Tốt      |         ❌ Không         |        ❌ Không         |       ❌ Không       |
| **Notion**             |     ✅ Tốt      |   ⚠️ Phức tạp   |       ⚠️ Tự build       |         ✅ Tốt          |     ⚠️ Tự build     |
| **Obsidian**           |    ❌ Không     |     ❌ Không     |          ✅ Tốt          |         ✅ Tốt          |       ❌ Không       |
| **Padlet / Raindrop**  |    ❌ Không     |     ❌ Không     |       ⚠️ Phụ trợ        |         ✅ Tốt          |       ❌ Không       |
| **Canvas / Moodle**    |     ⚠️ Yếu     |      ✅ Tốt      |          ✅ Tốt          |         ✅ Tốt          |       ❌ Không       |
| **Nền tảng đề xuất**   | **✅ Tích hợp** | **✅ Tích hợp**  |    **✅ Chuyên biệt**    |     **✅ Liên kết**     |   **✅ Trung tâm**   |

*(Chú thích: ✅ Đáp ứng tốt, ⚠️ Hỗ trợ một phần hoặc cần thiết lập phức tạp, ❌ Không hỗ trợ).*



# 01.3 — Sổ tay Ý tưởng & Tính năng chi tiết (Internal Notes)

## 1. Quản lý nhanh công việc
*   **Đại diện:** Todoist, TickTick, Microsoft To Do.
*   **Điểm mạnh:** Cực kỳ nhẹ, mở app ra là có thể gõ ngay việc cần làm. TickTick tích hợp sẵn đồng hồ Pomodoro. Todoist có tính năng nhận diện ngôn ngữ tự nhiên.
*   **Điểm yếu:** Chỉ là danh sách. Không có chỗ để quản lý tài liệu phức tạp hay lộ trình học tập dài hạn.
*   **Ý tưởng chắt lọc:**
    *   **Nút "Quick Add" (Thêm nhanh):** Cần một nút "+" luôn nổi trên màn hình để gõ nhanh task mà không cần chuyển trang.
    *   **Inbox (Hộp thư đến):** Cần một nơi chứa các task "chưa biết xếp vào đâu" để xử lý sau, xả rác trong đầu ra nhanh nhất.

## 2. Bảng điều khiển (Board & Workflow)
*   **Đại diện:** Trello, Jira, Asana, ClickUp.
*   **Điểm mạnh:** Quản lý trực quan theo dạng bảng Kanban (To do -> Doing -> Done). Nhìn vào biết ngay trạng thái.
*   **Điểm yếu:** Trello thiếu Calendar mạnh. Jira quá nặng tính quy trình doanh nghiệp (Epic, Sprint).
*   **Ý tưởng chắt lọc:**
    *   **Kéo thả (Drag & Drop):** Hỗ trợ view dạng Kanban để kéo Task từ "Đang làm" sang "Hoàn thành".
    *   **Thẻ Task (Task Card):** Click vào Task sẽ mở ra một Modal chứa thông tin chi tiết (Reference link, sub-tasks) thay vì tải trang mới.

## 3. Quản lý không gian làm việc học tập
*   **Đại diện:** Notion, Obsidian, Evernote.
*   **Điểm mạnh:** Linh hoạt tuyệt đối (viết text, chèn bảng, nhúng link, liên kết trang). 
*   **Điểm yếu:** "Lời nguyền tờ giấy trắng" – dễ ngợp, mất hàng giờ để tự thiết kế template.
*   **Ý tưởng chắt lọc:**
    *   **Cơ chế Reference (Liên kết):** Task không chứa file nặng, chỉ chứa đường link (URL) dẫn ra ngoài và Metadata (Tên, Icon).
    *   **Trình soạn thảo Markdown:** Phần mô tả (Description) của Task/Learning hỗ trợ Markdown cơ bản (in đậm, checklist, code block).

## 4. Hệ điều hành cá nhân & Lịch thông minh
*   **Đại diện:** Sunsama, Motion, Akiflow, Notion Calendar.
*   **Điểm mạnh:** Kéo Task từ mọi nơi về chung một Lịch. Có "Lên kế hoạch đầu ngày" (Daily Planning).
*   **Điểm yếu:** Giá đắt, setup API phức tạp.
*   **Ý tưởng chắt lọc:**
    *   **View "Today" làm trung tâm:** Cột trái là Task/Bài học chưa xếp lịch, cột phải là Lịch hôm nay. Kéo thả để block thời gian (Time-blocking).
    *   **Gom luồng (Unified Pipeline):** Dù dữ liệu gốc ở Learning hay Task, khi đến hạn chót đều "chảy" về Dashboard Today.

## 5. Hệ thống quản lý học tập (LMS)
*   **Đại diện:** Canvas, Moodle, Google Classroom.
*   **Điểm mạnh:** Cấu trúc học thuật rõ ràng (Khóa học -> Đề cương -> Bài tập).
*   **Điểm yếu:** Chỉ để thầy cô giao bài, sinh viên khó tạo lộ trình tự học.
*   **Ý tưởng chắt lọc:**
    *   **Cấu trúc dữ liệu Learning:** Áp dụng phân cấp: Chủ đề/Môn học -> Mục tiêu/Bài học -> Tài liệu liên kết.
    *   **Thanh tiến độ (Progress Bar):** Môn học cần có % hoàn thành để tạo động lực.

## 6. Bảng tương tác & Thiết kế trực quan
*   **Đại diện:** Padlet, Milanote, Wakelet, Pinterest.
*   **Điểm mạnh:** Thị giác hóa dữ liệu, hiển thị nội dung nhúng (Rich Embed), sắp xếp không gian (Spatial Memory).
*   **Điểm yếu:** Yếu trong quản lý tiến độ, không nhắc deadline.
*   **Ý tưởng chắt lọc:**
    *   **Giao diện "Card View" cho Reference:** Tự động bóc tách (crawl) metadata để hiển thị URL thành một thẻ (Card) có ảnh Thumbnail, Tiêu đề.
    *   **Bảng tài nguyên môn học:** Hiển thị tài liệu dạng "Bảng Padlet thu nhỏ" trong môn học.

## 7. Bản đồ tư duy & Lập kế hoạch
*   **Đại diện:** MindMeister, XMind, Coggle, Miro.
*   **Điểm mạnh:** Phân cấp trực quan (Hierarchy), kích thích luồng suy nghĩ.
*   **Điểm yếu:** Chỉ để "Nghĩ", không có thông báo nhắc việc hàng ngày.
*   **Ý tưởng chắt lọc:**
    *   **Tư duy rã cấu trúc (WBS):** Cho phép tạo Task lồng nhau (Sub-tasks nhiều cấp).
    *   **Tree View (Dạng cây):** Nút chuyển sang dạng Outline trong phân hệ Learning để thấy "Tọa độ" của bài học.

## 8. Quản lý dấu trang & Lưu trữ
*   **Đại diện:** Raindrop.io, Pocket, Evernote Web Clipper.
*   **Điểm mạnh:** Thu thập cực nhanh (Extension), phân loại thông minh (Tag/Folder).
*   **Điểm yếu:** Dễ bị hội chứng "lưu để đấy".
*   **Ý tưởng chắt lọc:**
    *   **Inbox Reference:** Một "thùng chứa" để quăng bừa các link bài viết chưa xác định ngữ cảnh.
    *   **Hệ thống Tagging:** Gắn tag (#frontend, #japanese) để lôi tài liệu ra đính kèm ngay khi tạo Task.

## 9. Học tập chủ động & Ghi nhớ (Active Recall)
*   **Đại diện:** Anki, Quizlet, RemNote.
*   **Điểm mạnh:** Chuyển kiến thức sang trí nhớ dài hạn nhờ lặp lại ngắt quãng.
*   **Điểm yếu:** Tách biệt hoàn toàn với công việc.
*   **Ý tưởng chắt lọc:**
    *   **Trạng thái "Độ tự tin":** Khi hoàn thành bài học, cho phép đánh giá: Dễ - Bình thường - Khó. Nếu "Khó", hệ thống tự động sinh Task nhắc ôn tập vào 3 ngày sau.

## 10. Tập trung & Theo dõi thời gian (Focus)
*   **Đại diện:** Forest, Toggl Track, Pomofocus.
*   **Điểm mạnh:** Time-boxing tích cực, thống kê thời gian thực.
*   **Điểm yếu:** Tách biệt với danh sách To-do.
*   **Ý tưởng chắt lọc:**
    *   **Tích hợp Pomodoro Timer:** Nút "Bắt đầu làm" trực tiếp trong Task kèm bộ đếm ngược 25 phút.

---
## ĐỊNH HÌNH SẢN PHẨM CUỐI CÙNG (The Hybrid Approach)
- **Tốc độ & Gọn nhẹ:** Quick Add + Inbox (Todoist).
- **Trực quan hóa luồng công việc:** Kanban Board (Trello).
- **Lưu trữ sinh động:** Rich Card View (Padlet) + Metadata Reference (Notion/Obsidian).
- **Phân rã cấu trúc:** Tree View + Sub-tasks (MindMeister).
- **Trung tâm điều phối:** Dashboard "Today" Time-blocking (Sunsama).
  
  
  
# Cải tiến tương lai

Tích hợp các api(gg calendar, ...) và ai(gemini)
Chia sẻ với người khác


# Lưu chat tạm
Đúng. Mình khuyên làm theo quy trình này:

1. **Mình phân tích → sinh nội dung chuẩn** (User Story, Use Case, Activity, Sequence...)
2. **Mình viết code PlantUML/Mermaid** (hoặc Draw.io XML nếu cần)
3. **Bạn import hoặc vẽ lại trên draw.io** để có hình đẹp đưa vào báo cáo.

Đây là cách rất nhiều đồ án làm.

### Use Case Diagram nên vẽ bằng gì?

- ✅ **draw.io (diagrams.net)** để vẽ cuối cùng.
- ✅ Mình sinh **PlantUML** trước để đảm bảo đúng logic.

Website:

- https://www.plantuml.com/plantuml
- [https://www.planttext.com/](https://www.planttext.com/)

Sau đó có thể chuyển sang draw.io hoặc vẽ lại.

---

### Có nên vẽ càng nhiều càng tốt không?

Không phải càng nhiều càng tốt, mà **đúng mức**.

Đề tài của bạn mình khuyên:

- ✅ 1 Use Case tổng quan (toàn hệ thống)
- ✅ 1 Use Case Auth
- ✅ 1 Use Case Task
- ✅ 1 Use Case Learning
- ✅ 1 Use Case Calendar
- ✅ 1 Use Case Reference

Tổng khoảng **6 sơ đồ** là đẹp.

---

### Về sau còn những sơ đồ gì?

Thông thường một đồ án sẽ có:

- ✅ Use Case Diagram
- ✅ Activity Diagram
- ✅ Sequence Diagram
- ✅ Class Diagram
- ✅ ERD
- ✅ Database Schema
- ✅ Deployment Diagram (nếu cần)

Mình sẽ giúp bạn làm lần lượt, và tất cả sẽ khớp với Requirements để tránh phải sửa nhiều lần. Đây cũng là cách dễ bảo trì nhất khi sau này thêm chức năng.