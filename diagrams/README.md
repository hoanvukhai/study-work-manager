# Diagrams — Sơ đồ hệ thống

Thư mục này chứa toàn bộ sơ đồ vẽ bằng **draw.io** (`.drawio`).  
Tất cả file `.drawio` đều được commit lên Git.  
Khi cần nhúng vào tài liệu: **export ra PNG** rồi lưu vào `exports/`.

---

## Danh sách sơ đồ

| File | Mô tả | Dùng trong tài liệu |
|---|---|---|
| `01_Context.drawio` | Context Diagram — hệ thống kết nối với ai bên ngoài | 04_System_Architecture.md |
| `02_Architecture.drawio` | High-Level Architecture — Browser → Next.js → NestJS → PostgreSQL | 04_System_Architecture.md |
| `03_UseCase.drawio` | Use Case Diagram — toàn bộ actor và use case | 03_Functional_Analysis.md |
| `04_Activity.drawio` | Activity Diagram — luồng các use case phức tạp | 03_Functional_Analysis.md |
| `05_Sequence.drawio` | Sequence Diagram — luồng giao tiếp giữa các thành phần | 04_System_Architecture.md |
| `06_ERD.drawio` | Entity-Relationship Diagram mức Logic | 06_Database_Design.md |
| `07_Deployment.drawio` | Deployment Diagram — cách deploy lên server | 11_Deployment.md |

---

## Cách sử dụng

### Mở file .drawio

**Cách 1 — Online (không cần cài đặt):**
1. Vào [draw.io](https://app.diagrams.net/)
2. File → Open from → Chọn file `.drawio` trong thư mục này

**Cách 2 — Desktop App:**
1. Tải [draw.io Desktop](https://github.com/jgraph/drawio-desktop/releases)
2. Mở file `.drawio` trực tiếp

**Cách 3 — VS Code Extension:**
1. Cài extension `hediet.vscode-drawio`
2. Mở file `.drawio` trong VS Code

---

### Export PNG để nhúng vào tài liệu

1. Mở file trong draw.io
2. File → Export As → PNG
3. Chọn:
   - **Border Width:** 10px
   - **Scale:** 2x (để ảnh sắc nét trên màn hình Retina)
   - **Transparent Background:** Không (nền trắng dễ đọc hơn)
4. Lưu vào `exports/` với tên kebab-case, ví dụ: `architecture-overview.png`

---

### Nhúng vào Markdown

```markdown
![Architecture Overview](../diagrams/exports/architecture-overview.png)
```

---

## Thư mục exports/

`exports/` chứa ảnh PNG đã export từ `.drawio`.  
Commit cả `exports/` lên Git để tài liệu hiển thị đúng trên GitHub.

```
exports/
├── context.png
├── architecture-overview.png
├── usecase-overview.png
├── activity-[tên].png
├── sequence-[tên].png
├── erd-logic.png
└── deployment.png
```
