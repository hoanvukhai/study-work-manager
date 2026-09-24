# CẨM NANG THIẾT KẾ GIAO DIỆN & BỘ PROMPT CHUẨN (ĐATN)

> **Đề tài:** Hệ thống Quản lý Học tập và Công việc Cá nhân (`study-work-manager`)  
> **Kiến trúc:** Lần 3 — Hạt nhân Đa hình (Hybrid Object Architecture)  
> **Triết lý UX cốt lõi:** *"Học tập và Công việc sống chung hòa hợp — Trao toàn quyền tự do cho người dùng"*  
> **Cập nhật:** 24/09/2026

---

## 🧭 PHẦN 1: TRIẾT LÝ SẢN PHẨM & CÁCH GIẢI BÀI TOÁN "HỌC TẬP & CÔNG VIỆC"

### 1. Bản chất thật sự của Đề tài
* **Không chia đôi cứng nhắc:** Hệ thống **tuyệt đối không chia đôi màn hình hay ép người dùng vào 2 cái khuôn tách biệt "Học" và "Làm"**. Cuộc sống thực tế của sinh viên luôn đan xen: đang học thì có bài tập phải nộp (Task), đang làm đồ án thì phải đọc tài liệu nghiên cứu (Note & Reference).
* **Triết lý Modular Workspace (như Notion / Obsidian):** Hệ thống cung cấp **các khối gạch nguyên tử** (`Task`, `Note`, `Event`, `Reference`, `Space`, `Relation`). Còn việc sắp xếp, phân loại và tổ chức không gian học tập/làm việc như thế nào là **toàn quyền tự do của người dùng**.

### 2. Các tính năng "Bù đắp" trao quyền cho người dùng:
1. **Dòng chảy thống nhất (Unified Stream):** Trong mỗi Không gian (Space), Note, Task, Event cùng xuất hiện tự nhiên, không bị ngăn cách.
2. **Bộ lọc đa năng tức thì (Omni-Filter):** Lọc nhanh `[Tất cả]` `[Chỉ hiện Việc]` `[Chỉ hiện Ghi chú]` `[Chỉ hiện Tài liệu]` bằng 1 click.
3. **Tùy biến góc nhìn (Pluggable Views):** Người dùng tự chọn góc nhìn yêu thích cho từng Space (Danh sách, Bảng việc Kanban, Bản đồ tư duy Canvas, hoặc Lịch trình).
4. **Liên kết chéo tự do (Freeform Relations):** Tự do liên kết Task với Note, Note với Note hay Task với Task để tạo mạng lưới tri thức 2 chiều.

---

## 🎨 PHẦN 2: DESIGN SYSTEM (BẢNG MÀU GOOGLE TỐI GIẢN)

* **Nền toàn trang (Canvas Bg):** Google Off-white `#f8f9fa` (dịu mắt, không lóa).
* **Nền thẻ / Thùng chứa (Surface):** Trắng tinh khiết `#ffffff`.
* **Đường kẻ / Viền (Border):** Siêu mỏng 1px `#dadce0` (không dùng viền dày, không bóng đổ hộp hộp).
* **Chữ chính (Primary Text):** Đen than Dark Charcoal `#202124` (sắc nét, dễ đọc chữ nhỏ).
* **Chữ phụ (Muted Text):** Xám trung tính `#5f6368` (ngày giờ, nhãn phụ).
* **Nút bấm chính (Action Button):** Xanh Google `#1a73e8` hoặc Đen than `#202124` chữ trắng.
* **Màu nhãn phân loại (Soft Pastel Pills):**
  * Task (Việc): Xanh dương nhạt (Nền `#e8f0fe`, chữ `#1967d2`)
  * Note (Ghi chú): Vàng ngà nhạt (Nền `#fef7e0`, chữ `#b06000`)
  * Event (Lịch hẹn): Xanh lá nhạt (Nền `#e6f4ea`, chữ `#137333`)
  * Reference (Tài liệu): Tím nhạt (Nền `#f3e8fd`, chữ `#7b1fa2`)
  * Cận hạn / Quá hạn: Đỏ nhạt (Nền `#fce8e6`, chữ `#c5221f`)
* **Bo góc:** Bo tròn nhẹ `rounded-md` (6px - 8px).

---

## 🚀 PHẦN 3: BỘ PROMPT CHUẨN SINH GIAO DIỆN (CHO v0.dev / CLAUDE / CHATGPT)

> **Quy trình sử dụng:** 
> 1. Mở **1 tab chat duy nhất** trên công cụ AI (v0.dev, Claude 3.5 Sonnet, hoặc ChatGPT).
> 2. Dán đoạn **Prompt Khởi tạo Hệ thống (Master Setup)** trước tiên.
> 3. Sau khi AI xác nhận "READY", dán lần lượt từng Mẫu dưới đây vào cùng đoạn chat đó để đảm bảo đồng bộ 100%.

---

### 🟢 BƯỚC 0: PROMPT KHỞI TẠO HỆ THỐNG (MASTER SETUP)

```text
You are a Principal Product Designer & Frontend Engineer. We are designing a personal productivity application called "Study & Work Manager" (Quản lý Học tập và Công việc Cá nhân).

We must strictly maintain 100% VISUAL & ARCHITECTURAL CONSISTENCY across all upcoming screens based on this unified Design System:

1. Design Philosophy: "Obsidian Workspace x Google Simplicity"
   - Freedom & User Agency: Tasks, Notes, Events, and References live together naturally (Unified Hybrid Objects). The user has total freedom to organize their workspace.
   - High cognitive focus (Deep Work), clean, distraction-free, content-first.

2. Unified Color Palette (Google Minimalist Neutral):
   - Canvas Background: Google Off-white #f8f9fa (soft, no glare)
   - Cards & Surfaces: Pure White #ffffff
   - Borders: Hairline 1px solid #dadce0 (no heavy drop shadows, no thick boxy borders)
   - Text Primary: Dark Charcoal #202124 (sharp, highly legible)
   - Text Secondary: Muted Gray #5f6368 (timestamps, sub-labels)
   - Primary Action Button: Google Blue #1a73e8 or Solid Dark #202124 with white text
   - Semantic Tag Pills: 
     * Task: Soft Blue (bg #e8f0fe, text #1967d2)
     * Note: Soft Amber (bg #fef7e0, text #b06000)
     * Event: Soft Green (bg #e6f4ea, text #137333)
     * Reference: Soft Purple (bg #f3e8fd, text #7b1fa2)
     * Urgent/Overdue: Soft Red (bg #fce8e6, text #c5221f)

3. Typography & Styling:
   - Font: Inter or Roboto, clean letter-spacing.
   - Border radius: rounded-md (6px - 8px) for buttons & cards.

Do you fully understand this design system and mental model? Please reply with a short confirmation "READY", and I will provide the screen specifications one by one.
```

---

### 🟢 MẪU 1: Bento Grid Command Center (Dành cho Trang chủ Dashboard `/dashboard`)
*Vai trò: Trạm điều phối ngày mới: hiển thị việc cần làm tiếp, việc khẩn cấp, lịch trình và ô ghi nhanh.*

```text
Screen 1: Now generate the main "Dashboard Overview" screen (/dashboard) using the exact Google x Obsidian Design System.
Theme: Google Clean Minimalist (#ffffff cards, #f8f9fa background, #dadce0 ultra-thin borders, #202124 text, font Inter).

Screen Layout:
1. Top Bar: Greeting "Xin chào Hoàn", search bar (Ctrl+K), and an open Quick Capture input box ("Gõ nhanh việc hoặc ý tưởng mới... Nhấn Enter để lưu vào Inbox").
2. Main Area is a 4-block Bento Grid:
   - Bento Box 1 (Large - 50% width): "Tiếp tục bài học & Dự án đang dở" (Context Resume) showing the active space "🎓 Đồ án tốt nghiệp", recent notes preview, and next pending task with a "Tiếp tục học" button.
   - Bento Box 2 (30% width): "Việc khẩn cấp hôm nay" (Urgent Tasks) list with check circles, due times ("14:00"), and priority badges.
   - Bento Box 3 (20% width): "Lịch trình hôm nay" (Mini-timeline) showing 2 events: "Tiết học Kiến trúc Phần mềm" (08:00) and "Gặp GVHD" (15:00).
   - Bento Box 4 (Bottom full width): "Mạng lưới Không gian học tập" showing 3 Space cards with completion ring percentages and object counters (Tasks, Notes, Docs).

Extremely modern, polished SaaS aesthetic inspired by Linear and Apple.
```

---

### 🟢 MẪU 2: Không gian Tự do Thống nhất (Dành cho Chi tiết Không gian `/spaces/:id`)
*Vai trò: Mọi loại đối tượng (Task, Note, Event, Reference) sống chung trong một dòng chảy; người dùng tự do ghim và chuyển đổi góc nhìn.*

```text
Screen 2: Now generate the "Space Detail Page" (/spaces/:id) for the space "🎓 Đồ án tốt nghiệp".
IMPORTANT: KEEP THE EXACT SAME fixed left sidebar, top header, font, colors, and styling from Screen 1.
Core Concept: Unified, non-rigid workspace where Tasks, Notes, and References live together seamlessly.

Layout:
1. Left Slim Sidebar (220px): Active highlighted on "🎓 Đồ án tốt nghiệp".
2. Main Content Area:
   - Header: Custom graduation cap icon, Space title "Đồ án tốt nghiệp", progress indicator (65% done), and a "+ Tạo mới" action button.
   - User-Control Toolbar:
     * View Switcher buttons: [ ☰ Danh sách ] [ 📋 Bảng Kanban ] [ 🌌 Bản đồ Canvas ] [ 📅 Lịch trình ].
     * Quick Type Filter: [ Tất cả (20) ] [ ☑️ Việc cần làm ] [ 📝 Ghi chú ] [ 🔗 Tài liệu ].
   - Main Body (Unified Stream - Everything lives together):
     * Section "📌 Ghim trên cùng": User pinned 1 core research Note ("Tài liệu kiến trúc hệ thống") next to 1 urgent Task ("Nộp đề cương tuần 4").
     * Section "Dòng chảy nội dung": A clean vertical flow of diverse items arranged by the user:
       - Item 1 (TASK): Checkbox circle, "Viết mã nguồn Prisma", deadline tag "28/09", tag #Backend.
       - Item 2 (NOTE): Expandable markdown card "Ghi chú buổi gặp GVHD" with 2 preview lines.
       - Item 3 (REFERENCE): Clean web bookmark "Prisma Docs" with favicon and URL.
       - Item 4 (TASK with Relation): "Kiểm thử API" showing an inline badge "🔗 Liên kết với: Ghi chú buổi gặp GVHD".

Clean, empowering, completely flexible, feeling like a modern digital notebook and task manager combined into one seamless canvas.
```

---

### 🟢 MẪU 3: Zen Canvas — Bản đồ Tri thức Vô cực (Góc nhìn bổ trợ trong Space)
*Vai trò: Bản đồ tư duy trực quan: các thẻ Task/Note nối dây với nhau trên mặt phẳng 2D.*

```text
Screen 3: Now generate the "Infinite Visual Canvas View" (Tab 'Bản đồ Canvas' inside the Space "🎓 Đồ án tốt nghiệp").
Theme: Google Clean Minimalist (Subtle dot-grid canvas background #f8f9fa, clean white cards #ffffff, 1px thin borders #dadce0, dark charcoal text #202124).

Visual Elements on Screen:
1. The Canvas Plane:
   - Subtle dot grid background pattern.
   - Top floating toolbar: Space name "🎓 Đồ án tốt nghiệp", tools (Hand tool, Card selector, Arrow connector, Text note, "+ Add Object"), and Zoom percentage (100%).
   - Bottom right: A sleek floating Mini-map and zoom controls (+ / -).

2. Floating Object Cards on the Canvas:
   - Card A (NOTE): Positioned at top-left. Title "📝 Kiến trúc Hybrid Object", showing 3 lines of markdown text and a tag #Architecture.
   - Card B (TASK): Positioned to the right of Card A. Checkbox circle, Title "☑️ Viết mã nguồn Prisma Schema", priority pill (HIGH in amber), due date "28/09".
   - Card C (REFERENCE): Positioned below Card A. A bookmark card with link preview "🔗 NestJS Official Documentation" and external link icon.

3. Visual Connector Lines (The Relations):
   - A smooth curved bezier arrow labeled "DEPENDS_ON" connecting Card B (Task) back to Card A (Note).
   - A straight connector line labeled "REFERENCES" connecting Card A (Note) to Card C (Reference).

The overall feel must be an intellectual, high-focus personal thinking canvas where study materials and actionable tasks are visually connected.
```

---

### 🟢 MẪU 4: Enhanced Kanban có Side-Peek Drawer (Góc nhìn Quản lý Tiến độ)
*Vai trò: Dành riêng cho việc kéo thả trạng thái Task, có bảng trượt đọc tài liệu đính kèm bên phải.*

```text
Screen 4: Now switch to the "Kanban Board View" for the Space "🎓 Đồ án tốt nghiệp".
IMPORTANT: KEEP THE EXACT SAME sidebar, header, and visual components.

Layout:
1. Header: Space title "🎓 Đồ án tốt nghiệp", Search/Filter bar, and "+ Thêm công việc" button.
2. Three Kanban Columns (Only filters Task objects):
   - "CẦN LÀM (TODO - 4)"
   - "ĐANG LÀM (IN PROGRESS - 2)"
   - "ĐÃ XONG (DONE - 8)"
3. Task Card Details (The Learning x Working connection):
   - Each task card has a drag handle, title, priority pill (HIGH, URGENT).
   - Bottom of task card has an attached "Study Material Pill" (e.g. "📝 2 Ghi chú đính kèm", "🔗 1 Link tài liệu").
   - One active card is clicked, smoothly sliding out a "Side Peek Drawer" from the right (width 400px) allowing the student to read the connected lecture notes while keeping the Kanban board in view.
```

---

### 🟢 MẪU 5: Hộp Nhận Tự Do / Unassigned Inbox (`/unassigned`)
*Vai trò: Thư viện chứa các ý tưởng, tài liệu gõ nhanh chưa kịp gán Space theo phong cách Capacities.*

```text
Screen 5: Now generate the "Unassigned Inbox" screen (/unassigned).
Theme: Google Clean Light theme (#ffffff cards, #f8f9fa canvas, #202124 text, Inter font).

Layout:
1. Top Section: Header "📥 Hộp Nhận Tự Do (Unassigned Inbox)", subtitle "Nơi lưu nhanh mọi ý tưởng, tài liệu trước khi phân loại vào Space".
2. View Filter Tabs: [ Tất cả (24) ] | [ 📝 Ghi chú (8) ] | [ ☑️ Công việc (12) ] | [ 🔗 Tài liệu (4) ].
3. Main Content: A clean 3-column masonry grid displaying diverse Hybrid Objects:
   - Card 1 (TASK): Checkbox circle, title "Đọc trước slide chương 4", due date pill "Hạn: Ngày mai".
   - Card 2 (NOTE): Note title "Ý tưởng thuật toán gợi ý", showing 3 lines of formatted text.
   - Card 3 (REFERENCE): Bookmark card for "Prisma Schema Docs" with site favicon and a 1-line summary.
   - Card 4 (EVENT): Calendar block card "Hẹn phỏng vấn thực tập" with a Green time chip.
```

---

### 🟢 MẪU 6: Chế độ Zen Focus Mode (Tập trung sâu — Phím tắt `F`)
*Vai trò: Ẩn 100% thanh điều hướng, chỉ để lại 1 bài học + checklist bài tập + đồng hồ Pomodoro.*

```text
Screen 6: Design a "Zen Focus Mode" screen for a personal productivity web app (triggered by pressing 'F').
Aesthetic: Distraction-free, pure minimalism, off-white paper canvas (#fafafa), dark charcoal typography, no sidebars, no top headers.

Layout:
1. Top bar: Only a subtle, fading breadcrumb "Đồ án tốt nghiệp / Chương 3: Thiết kế API" and a minimal "Thoát Zen Mode (Esc)" button in the top-right corner.
2. Centered Reading & Working Column (width 800px):
   - Top: A clean Markdown study note editor with title "Chi tiết kiến trúc Hybrid Object".
   - Bottom: A minimal checklist of 3 action tasks directly related to this document (with circular check buttons and strike-through on completion).
   - Bottom right: A subtle floating Pomodoro timer widget (25:00) with play/pause icons.
```

---

### 🟢 MẪU 7: Giao diện Di động Tinh gọn (Mobile View — 390 x 844 px)
*Vai trò: Thao tác nhanh trên smartphone: tích việc hôm nay, gõ nhanh ý tưởng, xem lịch.*

```text
Screen 7: Design a modern mobile UI screen (iPhone size, 390x844px) for "Study & Work Manager".
Theme: Google Clean Minimalist (White background, light borders #dadce0, dark text #202124).

Layout:
1. Top Bar: Greeting "Xin chào Hoàn", avatar, and search icon.
2. Content Stream:
   - Compact "Hôm nay làm gì?" section with 2 urgent tasks (checkbox circles, priority tags).
   - "Lịch trình" widget showing the next upcoming class/meeting with a countdown chip ("còn 45 phút").
   - "Ghi chú nhanh" carousel showing horizontal cards of recent notes.
3. Bottom Bar: Floating Action Button (+) for 1-tap quick capture, and a 4-tab bottom navigation (Trang chủ, Không gian, Lịch, Cá nhân).
```

---

## 🏆 PHẦN 4: CÔNG THỨC KẾT HỢP HOÀN HẢO CHO ĐỒ ÁN (THUYẾT TRÌNH BẢO VỆ)

Để đồ án đạt điểm tối đa trước Hội đồng, bạn chỉ cần liên kết các màn hình trên theo một câu chuyện mạch lạc:

1. **Khi mở web lên (Trang chủ):** Người dùng tiếp xúc với **Mẫu 1 (Bento Grid Dashboard)** $ightarrow$ Biết ngay việc hôm qua đang làm dở, việc gấp hôm nay, và có ô gõ nhanh ý tưởng mới.
2. **Khi vào một môn học/dự án cụ thể:** Người dùng mở **Mẫu 2 (Không gian Thống nhất)** $ightarrow$ Mọi ghi chú, tài liệu, bài tập sống chung một nơi, người dùng tự do ghim và lọc.
3. **Khi cần tập trung giải quyết bài tập:** Người dùng bấm tab sang **Mẫu 4 (Kanban)** để kéo thả tiến độ công việc, bấm mở tài liệu bên hông (Side-peek) để vừa xem bài vừa làm.
4. **Khi cần tập trung viết luận văn/học sâu:** Người dùng bấm `F` sang **Mẫu 6 (Zen Focus)** $ightarrow$ Tắt toàn bộ phiền nhiễu xung quanh.
5. **Khi thuyết trình trước thầy cô:** Bạn mở **Mẫu 3 (Zen Canvas)** $ightarrow$ Khoe toàn bộ mạng lưới tri thức liên kết đa chiều (Graph Node) chứng minh tính ưu việt của Kiến trúc Lần 3!
