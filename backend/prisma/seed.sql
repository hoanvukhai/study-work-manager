
-- 1. Insert User
INSERT INTO users (id, email, password_hash, full_name, avatar_url, created_at, updated_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'hoan@example.com',
  '$2b$10$abcdefghijklmnopqrstuv',
  'Vũ Khải Hoàn',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoan',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 2. Insert Spaces
INSERT INTO spaces (id, user_id, name, description, icon, color, is_archived, created_at, updated_at)
VALUES
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Đồ án tốt nghiệp', 'Hệ thống Quản lý Học tập và Công việc Cá nhân', '🎓', '#1a73e8', false, NOW(), NOW()),
  ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Việc Freelance', 'Các dự án nhận thêm ngoài giờ', '💼', '#f59e0b', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Diverse Objects
INSERT INTO objects (id, user_id, type, title, description, status, priority, lifecycle, due_date, url, metadata, created_at, updated_at)
VALUES
  (
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'NOTE',
    'Ghi chú góp ý của Thầy Cường',
    '- Tập trung vào kiến trúc Hybrid Object\n- Chú ý liên kết chéo giữa Note và Task\n- Giao diện tối giản theo chuẩn Google',
    'TODO',
    'HIGH',
    'ACTIVE',
    NULL,
    NULL,
    '{}',
    NOW(),
    NOW()
  ),
  (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'TASK',
    'Hoàn thiện bản thiết kế 22 API endpoints',
    'Đặc tả chi tiết Request/Response cho module Object và Relation',
    'DONE',
    'HIGH',
    'ACTIVE',
    NOW() + INTERVAL '2 days',
    NULL,
    '{}',
    NOW(),
    NOW()
  ),
  (
    'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'TASK',
    'Khởi tạo Prisma Schema và nạp dữ liệu mẫu 8 bảng',
    'Cài đặt Docker PostgreSQL cổng 5435 và kiểm tra kết nối',
    'IN_PROGRESS',
    'URGENT',
    'ACTIVE',
    NOW() + INTERVAL '1 day',
    NULL,
    '{}',
    NOW(),
    NOW()
  ),
  (
    'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'REFERENCE',
    'NestJS & Prisma Documentation',
    'Tài liệu tham khảo công nghệ chính thức',
    'TODO',
    'MEDIUM',
    'ACTIVE',
    NULL,
    'https://docs.nestjs.com/recipes/prisma',
    '{}',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Insert SpaceObjects (Placement)
INSERT INTO space_objects (id, space_id, object_id, position, is_pinned, added_at)
VALUES
  (gen_random_uuid(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 0, true, NOW()),
  (gen_random_uuid(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 1, false, NOW()),
  (gen_random_uuid(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 2, true, NOW()),
  (gen_random_uuid(), 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 3, false, NOW())
ON CONFLICT (space_id, object_id) DO NOTHING;

-- 5. Insert ObjectRelation
INSERT INTO object_relations (id, from_object_id, to_object_id, relation_type, created_at)
VALUES (
  gen_random_uuid(),
  'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  'DEPENDS_ON',
  NOW()
) ON CONFLICT (from_object_id, to_object_id, relation_type) DO NOTHING;

-- 6. Insert Tag & ObjectTag
INSERT INTO tags (id, user_id, name, color, created_at)
VALUES ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a88', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'KiếnTrúc', '#3b82f6', NOW())
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO object_tags (object_id, tag_id)
VALUES ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a88')
ON CONFLICT (object_id, tag_id) DO NOTHING;

-- 7. Insert Notification
INSERT INTO notifications (id, user_id, object_id, title, message, is_read, created_at)
VALUES (
  gen_random_uuid(),
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
  'Nhắc nhở hạn chót',
  'Nhiệm vụ "Khởi tạo Prisma Schema" cần hoàn thành trong hôm nay.',
  false,
  NOW()
);
