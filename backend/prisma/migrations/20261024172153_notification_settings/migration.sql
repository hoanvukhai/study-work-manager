-- CreateTable
CREATE TABLE "notification_settings" (
    "user_id" UUID NOT NULL,
    "remind_before_minutes" INTEGER NOT NULL DEFAULT 1440,
    "quiet_hours_enabled" BOOLEAN NOT NULL DEFAULT false,
    "quiet_start_minute" INTEGER NOT NULL DEFAULT 1380,
    "quiet_end_minute" INTEGER NOT NULL DEFAULT 420,
    "enable_deadline" BOOLEAN NOT NULL DEFAULT true,
    "enable_overdue" BOOLEAN NOT NULL DEFAULT true,
    "enable_event" BOOLEAN NOT NULL DEFAULT true,
    "enable_digest" BOOLEAN NOT NULL DEFAULT true,
    "enable_study" BOOLEAN NOT NULL DEFAULT true,
    "enable_unblocked" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Ràng buộc cài đặt thông báo
ALTER TABLE "notification_settings" ADD CONSTRAINT "notif_remind_range" CHECK (remind_before_minutes BETWEEN 5 AND 10080);
ALTER TABLE "notification_settings" ADD CONSTRAINT "notif_quiet_range" CHECK (quiet_start_minute BETWEEN 0 AND 1439 AND quiet_end_minute BETWEEN 0 AND 1439);
