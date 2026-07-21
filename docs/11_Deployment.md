# 11_Deployment.md — Triển khai

> **Tầng:** Development (Tầng 3 / 3)  
> **Phụ thuộc vào:** [10_Testing.md](10_Testing.md)  
> **Tài liệu tiếp theo:** [12_Report_Notes.md](12_Report_Notes.md)  
> **Trạng thái:** ⬜ Chưa bắt đầu  
> **Cập nhật lần cuối:** —

---

## 1. Môi trường

| Môi trường | Mục đích | URL |
|---|---|---|
| Local (dev) | Phát triển | `http://localhost:3000` (FE), `http://localhost:3001` (BE) |
| Staging (optional) | Test trước khi deploy | — |
| Production | Demo + nộp đồ án | *(điền sau)* |

---

## 2. Yêu cầu server (Production)

*(Điền sau khi chọn nền tảng deploy)*

**Đề xuất cho đồ án (miễn phí/chi phí thấp):**

| Thành phần | Dịch vụ đề xuất | Ghi chú |
|---|---|---|
| Frontend (Next.js) | Vercel | Free tier, deploy từ GitHub tự động |
| Backend (NestJS) | Railway / Render | Free tier có giới hạn sleep |
| Database (PostgreSQL) | Supabase / Railway | Free tier, 500MB |

---

## 3. Environment Variables

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-secret-key-here"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

---

## 4. Deploy Steps

### Frontend (Vercel)
```bash
# 1. Push code lên GitHub
git push origin main

# 2. Vào vercel.com → Import repo → Vercel tự detect Next.js
# 3. Thêm environment variables trong Vercel dashboard
# 4. Deploy
```

### Backend (Railway)
```bash
# 1. Vào railway.app → New Project → Deploy from GitHub
# 2. Thêm PostgreSQL service
# 3. Thêm environment variables
# 4. Đảm bảo Dockerfile hoặc nixpacks hoạt động
```

---

## 5. Post-Deploy Checklist

- [ ] Frontend load được trang login
- [ ] API `/health` (nếu có) trả về 200
- [ ] Database đã chạy migration
- [ ] Đăng ký tài khoản mới thành công trên production
- [ ] CORS config đúng (frontend domain → backend)

---

## 6. Ghi chú vận hành

*(Ghi lại các vấn đề gặp phải khi deploy và cách giải quyết)*

| Ngày | Vấn đề | Giải pháp |
|---|---|---|
| — | — | — |

---

*Tài liệu tiếp theo trong chuỗi: [12_Report_Notes.md](12_Report_Notes.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
