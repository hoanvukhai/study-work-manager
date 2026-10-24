-- AlterTable
ALTER TABLE "objects" ADD COLUMN     "estimated_minutes" INTEGER;

-- Chỉ Task mới có thời gian ước lượng
ALTER TABLE "objects" ADD CONSTRAINT "objects_estimate_only_task" CHECK (type = 'TASK' OR estimated_minutes IS NULL);
