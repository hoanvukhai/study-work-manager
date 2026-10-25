# 11_Deployment.md — Triển khai

> Tài liệu trước: [10_Testing.md](10_Testing.md)
> Tài liệu sau: [12_Report_Notes.md](12_Report_Notes.md)

---

## 1. Các môi trường

| Môi trường | Cách chạy | Địa chỉ |
|---|---|---|
| **Phát triển** | PostgreSQL bằng Docker (`docker-compose.yml`), backend và frontend chạy bằng `npm` | Giao diện `http://localhost:3000`, API `http://localhost:3001/api/v1`, Swagger `/api/docs` |
| **Đóng gói (production)** | Toàn bộ bằng Docker: `docker-compose.prod.yml` (CSDL + API + giao diện) | Giống trên, đổi qua biến môi trường |

Đã **chạy thử thật** bằng Docker: build hai ảnh, khởi động cả ba dịch vụ, migration tự áp, đăng ký tài khoản qua API thành công.

## 2. Chạy môi trường phát triển

```bash
docker compose up -d                       # PostgreSQL ở cổng 5435
cd backend
cp .env.example .env                       # đặt JWT_SECRET (bắt buộc), kiểm tra DATABASE_URL
npm install
npx prisma migrate deploy                  # hoặc: npx prisma migrate reset --force  (xoá sạch + nạp dữ liệu mẫu)
npm run start:dev                          # API
cd ../frontend && npm install && npm run dev
```

Dữ liệu mẫu (`npx prisma migrate reset --force`): tài khoản `demo@example.com / Password123!` và quản trị `admin@example.com / Admin12345!`. **Chỉ dùng khi phát triển** — không nạp dữ liệu mẫu lên máy chủ thật.

## 3. Triển khai bằng Docker

```bash
cp .env.prod.example .env                  # sửa POSTGRES_PASSWORD, JWT_SECRET, các địa chỉ
docker compose -f docker-compose.prod.yml up -d --build
```

- `backend/Dockerfile`: nhiều giai đoạn (build → ảnh chạy gọn); khi khởi động tự chạy `prisma migrate deploy` rồi mới bật API.
- `frontend/Dockerfile`: Next.js chế độ *standalone*. **Địa chỉ API được đóng vào mã giao diện lúc build** (`NEXT_PUBLIC_API_URL`), nên đổi địa chỉ phải build lại.
- CSDL chỉ nằm trong mạng Docker nội bộ (không mở cổng ra ngoài), dữ liệu ở volume `pgdata`.
- Tạo tài khoản Admin đầu tiên (chưa có dữ liệu mẫu trên máy chủ thật): đăng ký tài khoản bình thường rồi nâng quyền:

```bash
docker compose -f docker-compose.prod.yml exec db psql -U postgres -d study_work_db \
  -c "UPDATE users SET role = 'ADMIN' WHERE email = 'ban@example.com';"
```

## 4. Biến môi trường

| Biến | Dịch vụ | Ý nghĩa | Bắt buộc |
|---|---|---|:-:|
| `DATABASE_URL` | backend | Chuỗi kết nối PostgreSQL | ✓ |
| `JWT_SECRET` | backend | Khoá ký JWT (chuỗi ngẫu nhiên dài). **Không có giá trị mặc định** — thiếu thì backend từ chối khởi động | ✓ |
| `JWT_ACCESS_EXPIRES_IN` | backend | Thời hạn token (mặc định `7d`) | |
| `PORT` | backend | Cổng API (mặc định 3001) | |
| `CORS_ORIGIN` | backend | Các địa chỉ giao diện được phép gọi API, cách nhau bằng dấu phẩy | |
| `APP_URL` | backend | Địa chỉ giao diện, dùng trong liên kết email | |
| `THROTTLE_LIMIT`, `THROTTLE_AUTH_LIMIT` | backend | Giới hạn yêu cầu / phút / IP (chung; riêng cho đăng nhập) | |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | backend | Gửi email đặt lại mật khẩu. Để trống `SMTP_HOST` thì **chỉ ghi liên kết ra log** (chế độ phát triển) | |
| `NEXT_PUBLIC_API_URL` | frontend (lúc build) | Địa chỉ API mà trình duyệt gọi | |
| `POSTGRES_PASSWORD` | docker | Mật khẩu CSDL | ✓ |

Tệp `.env` không bao giờ được đưa lên Git (đã nằm trong `.gitignore`); chỉ có `.env.example` / `.env.prod.example`.

## 5. Triển khai lên dịch vụ đám mây (hướng dẫn)

| Thành phần | Gợi ý | Ghi chú |
|---|---|---|
| Giao diện | Vercel (thư mục gốc `frontend`, đặt `NEXT_PUBLIC_API_URL`) hoặc chạy ảnh Docker | |
| API | Railway / Render / VPS chạy ảnh `backend/Dockerfile` | Đặt `CORS_ORIGIN` = địa chỉ giao diện |
| CSDL | Supabase / Railway PostgreSQL / container | Backend tự áp migration khi khởi động |

**Lưu ý khi đưa lên mạng công khai:**
- Dùng **HTTPS** (qua reverse proxy hoặc nền tảng đám mây); đặt `JWT_SECRET` và mật khẩu CSDL mạnh.
- **Lịch `.ics`:** Google Calendar chỉ truy cập được địa chỉ công khai; trên `localhost` thì không đồng bộ được.
- **Email:** cần cấu hình SMTP thật thì tính năng quên mật khẩu mới gửi được thư.
- Bộ quét thông báo và sinh việc lặp chạy **trong tiến trình backend** (cron) — chỉ chạy **một bản sao** backend, nếu chạy nhiều bản sao thì cần tách tác vụ nền riêng.

## 6. Hạn chế đã biết

- Token lưu ở `localStorage` (đơn giản, phù hợp quy mô đồ án); hướng phát triển: cookie `HttpOnly` + refresh token.
- Chưa có tệp đính kèm, đồng bộ hai chiều với dịch vụ ngoài, thông báo đẩy.

---

*Tài liệu tiếp theo: [12_Report_Notes.md](12_Report_Notes.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
