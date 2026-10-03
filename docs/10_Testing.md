# 10_Testing.md — Kiểm thử

> Tài liệu trước: [09_Implementation.md](09_Implementation.md)
> Tài liệu sau: [11_Deployment.md](11_Deployment.md)

---

## 1. Chiến lược kiểm thử

| Loại test | Công cụ | Mục tiêu |
|---|---|---|
| Unit Test | Jest (NestJS built-in) | Kiểm thử Service layer: logic đa hình, vòng đời dữ liệu, validation |
| Integration Test | Jest + Supertest | Kiểm thử toàn diện API endpoints theo Use Cases |
| Manual Test | Postman / Trình duyệt | Kiểm thử luồng thao tác thực tế người dùng (gán Space, liên kết chéo) |

---

## 2. Unit Test (Backend)

> Tập trung vào **`ObjectService`** và **`RelationService`** — nơi chứa toàn bộ logic cốt lõi của Kiến trúc Lần 3.

```typescript
// backend/src/object/object.service.spec.ts
describe('ObjectService', () => {
  describe('createObject', () => {
    it('should create a valid Task object with status and priority', async () => {
      const dto = {
        type: 'TASK',
        title: 'Hoàn thiện bản vẽ ERD',
        status: 'TODO',
        priority: 'HIGH',
      };
      const result = await service.create(mockUserId, dto);
      expect(result).toHaveProperty('id');
      expect(result.type).toBe('TASK');
      expect(result.lifecycle).toBe('ACTIVE');
    });

    it('should create a Note object without requiring dueDate', async () => {
      const dto = {
        type: 'NOTE',
        title: 'Biên bản góp ý với GVHD',
        description: 'Thầy dặn tập trung vào liên kết chéo',
      };
      const result = await service.create(mockUserId, dto);
      expect(result.type).toBe('NOTE');
      expect(result.dueDate).toBeNull();
    });
  });

  describe('updateLifecycle', () => {
    it('should move an object to TRASH and record deletedAt', async () => {
      const result = await service.changeLifecycle(mockUserId, objectId, 'TRASH');
      expect(result.lifecycle).toBe('TRASH');
      expect(result.deletedAt).toBeDefined();
    });

    it('should restore an object from TRASH back to ACTIVE', async () => {
      const result = await service.changeLifecycle(mockUserId, objectId, 'RESTORE');
      expect(result.lifecycle).toBe('ACTIVE');
      expect(result.deletedAt).toBeNull();
    });
  });
});
```

---

## 3. Integration Test (API Endpoints Lần 3)

| Test Case | Use Case | Endpoint & Phương thức | Kết quả mong đợi |
|---|---|---|---|
| TC-01 | UC-01 | `POST /api/v1/auth/register` | 201 Created (trả về User mới) |
| TC-02 | UC-02 | `POST /api/v1/auth/login` | 200 OK + JWT Access/Refresh tokens |
| TC-03 | UC-05 | `POST /api/v1/spaces` | 201 Created (Tạo Space mới) |
| TC-04 | UC-07 | `POST /api/v1/objects` | 201 Created (Tạo Task/Note/Event mới) |
| TC-05 | UC-14 | `POST /api/v1/spaces/:spaceId/objects/:objectId` | 201 Created (Gán Object vào Space) |
| TC-06 | UC-15 | `DELETE /api/v1/spaces/:spaceId/objects/:objectId`| 200 OK (Gỡ khỏi Space, Object gốc vẫn tồn tại) |
| TC-07 | UC-16 | `POST /api/v1/relations` | 201 Created (Tạo liên kết chéo 2 chiều) |
| TC-08 | UC-11 | `PATCH /api/v1/objects/:id/lifecycle` | 200 OK (Chuyển Object vào Thùng rác) |
| TC-09 | — | `GET /api/v1/views/kanban` | 200 OK (Chỉ gom nhóm các Object loại Task theo status) |
| TC-10 | — | `GET /api/v1/views/unassigned` | 200 OK (Lấy danh sách Object chưa thuộc Space nào) |

---

## 4. Manual Test Checklist

- [ ] **Xác thực:** Đăng ký, đăng nhập, bảo vệ API khi không có Token.
- [ ] **Không gian (Space):** Tạo Space mới, đổi màu/icon, xóa Space (kiểm tra các Object con không bị xóa mà chuyển về Unassigned).
- [ ] **Hạt nhân Đa hình (Object):**
  - [ ] Tạo Task (có deadline, có mức ưu tiên).
  * [ ] Tạo Note (có văn bản dài Markdown, không cần deadline).
  * [ ] Tạo Event (có mốc thời gian bắt đầu/kết thúc).
  * [ ] Tạo Reference (có link liên kết ngoài).
- [ ] **Gán đa Không gian (Placement):** Đặt 1 Task vào đồng thời 2 Space khác nhau.
- [ ] **Liên kết chéo (Relation):** Tạo liên kết giữa 1 Note và 1 Task, kiểm tra hiển thị 2 chiều.
- [ ] **Vòng đời dữ liệu:** Chuyển vào Thùng rác -> Khôi phục -> Xóa vĩnh viễn.
- [ ] **Góc nhìn (Views):** Xem dạng Bảng việc Kanban (chỉ hiển thị Task), xem Lịch biểu Calendar.

---

*Tài liệu tiếp theo: [11_Deployment.md](11_Deployment.md)*  
*Quay lại mục lục: [docs/README.md](README.md)*
