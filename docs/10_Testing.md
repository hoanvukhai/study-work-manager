# 10_Testing.md — Kiểm thử

> **Tầng:** Development (Tầng 3 / 3)  
> **Phụ thuộc vào:** [09_Implementation.md](09_Implementation.md), [03_Functional_Analysis.md](03_Functional_Analysis.md) — Use Cases  
> **Tài liệu tiếp theo:** [11_Deployment.md](11_Deployment.md)  
> **Trạng thái:** ⬜ Chưa bắt đầu  
> **Cập nhật lần cuối:** —

---

## 1. Chiến lược kiểm thử

| Loại test | Công cụ | Mục tiêu |
|---|---|---|
| Unit Test | Jest (NestJS built-in) | Kiểm thử từng Service, đặc biệt là business logic |
| Integration Test | Jest + Supertest | Kiểm thử API endpoint end-to-end |
| Manual Test | Postman / Trình duyệt | Kiểm thử luồng người dùng thực tế |

---

## 2. Unit Test (Backend)

> Tập trung vào **Service layer** — nơi chứa business logic.

**Ví dụ: TaskService**

```typescript
// task.service.spec.ts
describe('TaskService', () => {
  describe('create', () => {
    it('should throw BadRequestException if dueDate < createdAt', async () => {
      // REF: FR-TASK-02, Business Rule BR-02
      const dto = {
        title: 'Test task',
        dueDate: '2020-01-01T00:00:00Z', // ngày trong quá khứ
      };
      await expect(service.create(userId, dto)).rejects.toThrow(BadRequestException);
    });
  });
});
```

---

## 3. Integration Test (API)

> Kiểm thử API theo Use Case — mỗi test case tương ứng một luồng từ UC-*.

| Test Case | UC liên quan | Endpoint | Kết quả mong đợi |
|---|---|---|---|
| TC-01 | UC-01 | POST /auth/register | 201 Created |
| TC-02 | UC-01 | POST /auth/register (email đã tồn tại) | 409 Conflict |
| TC-03 | UC-02 | POST /auth/login | 200 + tokens |
| TC-04 | — | POST /tasks (không có token) | 401 Unauthorized |
| TC-05 | — | POST /tasks (dueDate quá khứ) | 400 Bad Request |
| TC-06 | — | GET /tasks/:id (của người khác) | 403 Forbidden |

*(Điền thêm vào đây khi viết test)*

---

## 4. Manual Test Checklist

> Dùng khi test thủ công trước khi demo hoặc nộp.

**Auth:**
- [ ] Đăng ký tài khoản mới thành công
- [ ] Đăng ký với email đã tồn tại → hiển thị lỗi
- [ ] Đăng nhập thành công
- [ ] Đăng nhập sai mật khẩu → hiển thị lỗi
- [ ] Refresh token khi access token hết hạn

**Task:**
- [ ] Tạo task mới với đầy đủ thông tin
- [ ] Tạo task không có deadline
- [ ] Cập nhật status task
- [ ] Xóa task
- [ ] Lọc task theo status/priority/tag

**Responsive:**
- [ ] Layout hiển thị đúng trên mobile (375px)
- [ ] Layout hiển thị đúng trên tablet (768px)
- [ ] Layout hiển thị đúng trên desktop (1280px)

---

## 5. Kết quả kiểm thử

*(Điền vào sau khi chạy test)*

| | Số lượng | Pass | Fail |
|---|---|---|---|
| Unit Tests | — | — | — |
| Integration Tests | — | — | — |
| Manual Test Cases | — | — | — |

---

*Tài liệu tiếp theo trong chuỗi: [11_Deployment.md](11_Deployment.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
