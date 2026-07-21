# Report — Bản nháp báo cáo tốt nghiệp

Thư mục này chứa **bản nháp** báo cáo tốt nghiệp được viết bằng Markdown.  
Mục tiêu: viết từng chương dựa trên tài liệu trong `docs/`, sau đó tổng hợp thành báo cáo Word/PDF chính thức.

---

## Ánh xạ: Tài liệu docs/ → Chương báo cáo

| Chương | Nội dung | Tài liệu nguồn |
|---|---|---|
| Chương 1 | Tổng quan đề tài: lý do chọn, mục tiêu, đối tượng & phạm vi, phương pháp | [01_Research.md](../docs/01_Research.md) |
| Chương 2 | Phân tích yêu cầu: research, requirement, user story, use case | [01_Research.md](../docs/01_Research.md) + [02_Requirement.md](../docs/02_Requirement.md) + [03_Functional_Analysis.md](../docs/03_Functional_Analysis.md) |
| Chương 3 | Phân tích & Thiết kế hệ thống: architecture, domain, DB, API, UI | [04](../docs/04_System_Architecture.md) + [05](../docs/05_Domain_Model.md) + [06](../docs/06_Database_Design.md) + [07](../docs/07_API_Design.md) + [08](../docs/08_UI_UX_Design.md) |
| Chương 4 | Xây dựng & Triển khai: implementation, testing, deployment | [09](../docs/09_Implementation.md) + [10](../docs/10_Testing.md) + [11](../docs/11_Deployment.md) |
| Chương 5 | Kết luận & Hướng phát triển | [12_Report_Notes.md](../docs/12_Report_Notes.md) |

---

## Cấu trúc thư mục

```
report/
├── README.md                ← File này
├── drafts/
│   ├── ch1_overview.md      ← Nháp Chương 1
│   ├── ch2_analysis.md      ← Nháp Chương 2
│   ├── ch3_design.md        ← Nháp Chương 3
│   ├── ch4_implementation.md← Nháp Chương 4
│   └── ch5_conclusion.md    ← Nháp Chương 5
├── images/
│   ├── ch2/                 ← Hình ảnh cho Chương 2
│   ├── ch3/                 ← Hình ảnh cho Chương 3 (diagrams, wireframe)
│   └── ch4/                 ← Hình ảnh cho Chương 4 (screenshot app)
└── references/
    └── bibliography.md      ← Danh sách tài liệu tham khảo
```

---

## Workflow viết báo cáo

```
Bước 1: Tài liệu docs/ đã hoàn thành
Bước 2: Viết nháp từng chương trong drafts/
         → Copy/paraphrase từ docs/ + thêm lời dẫn, kết nối
Bước 3: Thu thập hình ảnh vào images/
         → Export từ diagrams/, screenshot app, export Figma
Bước 4: Tổng hợp thành báo cáo Word/LaTeX chính thức
         → Nộp cho trường theo định dạng yêu cầu
```

---

## Lưu ý khi viết báo cáo

- **Không viết lại từ đầu** — mọi nội dung đã có trong `docs/`, chỉ cần paraphrase và thêm lời dẫn.
- **Hình ảnh trong báo cáo** = ảnh export từ diagrams/ và screenshot app thực tế.
- **Văn phong:** viết tự nhiên như sinh viên, tránh thuật ngữ không giải thích được.
- **Cross-reference:** mỗi quyết định thiết kế trong Chương 3 phải liên kết được về Chương 2 (vì sao có bảng này? → xem Requirement/Pain Point).
