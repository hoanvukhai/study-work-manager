-- AlterTable
ALTER TABLE "objects" ADD COLUMN     "completed_at" TIMESTAMPTZ;

-- Bổ sung thời điểm hoàn thành cho các Task đã xong trước đây (xấp xỉ bằng lần cập nhật cuối)
UPDATE "objects" SET "completed_at" = "updated_at" WHERE "status" = 'DONE' AND "type" = 'TASK' AND "completed_at" IS NULL;
