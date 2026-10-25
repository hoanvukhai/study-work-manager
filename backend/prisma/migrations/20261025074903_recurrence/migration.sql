-- AlterTable
ALTER TABLE "objects" ADD COLUMN     "recurrence" JSONB,
ADD COLUMN     "recurrence_spawned" BOOLEAN NOT NULL DEFAULT false;

-- Chỉ Task và Event mới có luật lặp
ALTER TABLE "objects" ADD CONSTRAINT "objects_recurrence_task_event" CHECK (type IN ('TASK', 'EVENT') OR recurrence IS NULL);
