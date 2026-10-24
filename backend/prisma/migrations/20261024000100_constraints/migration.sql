-- Ràng buộc toàn vẹn theo loại Object (QD-07) và liên kết (QD-09). Prisma không tự sinh CHECK.
ALTER TABLE "objects" ADD CONSTRAINT "objects_event_has_start" CHECK (type <> 'EVENT' OR start_at IS NOT NULL);
ALTER TABLE "objects" ADD CONSTRAINT "objects_reference_has_url" CHECK (type <> 'REFERENCE' OR url IS NOT NULL);
ALTER TABLE "objects" ADD CONSTRAINT "objects_time_order" CHECK (start_at IS NULL OR end_at IS NULL OR end_at > start_at);
ALTER TABLE "objects" ADD CONSTRAINT "objects_status_only_task" CHECK (type = 'TASK' OR status IS NULL);
ALTER TABLE "objects" ADD CONSTRAINT "objects_priority_task_event" CHECK (type IN ('TASK', 'EVENT') OR priority IS NULL);
ALTER TABLE "object_relations" ADD CONSTRAINT "object_relations_no_self" CHECK (from_object_id <> to_object_id);
