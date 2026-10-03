# 11_Deployment.md — Triển khai

> Tài liệu trước: [10_Testing.md](10_Testing.md)
> Tài liệu sau: [12_Report_Notes.md](12_Report_Notes.md)

---

## 1. Môi trường

| Môi trường | Mục đích | URL |
|---|---|---|
| Local (dev) | Phát triển nội bộ | `http://localhost:3000` (FE), `http://localhost:3001` (BE) |
| Production | Demo nghiệm thu ĐATN | *(Vercel cho Frontend, Railway/Render cho Backend)* |

---

## 2. Nền tảng triển khai đề xuất

| Thành phần | Dịch vụ đề xuất | Ghi chú |
|---|---|---|
| Frontend (Next.js) | Vercel | Tự động CI/CD từ GitHub branch `main` |
| Backend (NestJS) | Railway / Render | Chạy Docker container hoặc Node.js server |
| Database (PostgreSQL) | Supabase / Railway | Cơ sở dữ liệu PostgreSQL cho 8 bảng dữ liệu |

---

## 3. Environment Variables (Biến môi trường)

**Backend (`.env`):**
```env
DATABASE_URL="postgresql://user:password@host:5432/study_work_db?schema=public"
JWT_SECRET="super-secret-jwt-key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
CORS_ORIGIN="http://localhost:3000,https://study-work-manager.vercel.app"
```

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```

---

## 4. Các bước triển khai (Deploy Steps)

### Chạy Migration Database (Prisma)
```bash
# Áp dụng migration cho 8 bảng dữ liệu lên production database
npx prisma migrate deploy
```

### Triển khai Frontend lên Vercel
1. Kết nối repository GitHub `hoanvukhai/study-work-manager` với Vercel.
2. Cấu hình root directory: `./frontend`.
3. Thêm biến môi trường `NEXT_PUBLIC_API_URL`.
4. Deploy tự động.

---

*Tài liệu tiếp theo: [12_Report_Notes.md](12_Report_Notes.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
