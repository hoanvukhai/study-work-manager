-- CreateEnum
CREATE TYPE "ReviewGrade" AS ENUM ('AGAIN', 'HARD', 'GOOD', 'EASY');

-- CreateTable
CREATE TABLE "flashcards" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "object_id" UUID NOT NULL,
    "front" VARCHAR(500) NOT NULL,
    "back" VARCHAR(2000) NOT NULL,
    "ease_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "interval_days" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "due_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_reviews" (
    "id" UUID NOT NULL,
    "card_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "grade" "ReviewGrade" NOT NULL,
    "interval_after" INTEGER NOT NULL,
    "ease_after" DOUBLE PRECISION NOT NULL,
    "reviewed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flashcard_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "object_id" UUID,
    "minutes" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flashcards_user_id_due_at_idx" ON "flashcards"("user_id", "due_at");

-- CreateIndex
CREATE UNIQUE INDEX "flashcards_object_id_front_key" ON "flashcards"("object_id", "front");

-- CreateIndex
CREATE INDEX "flashcard_reviews_user_id_reviewed_at_idx" ON "flashcard_reviews"("user_id", "reviewed_at");

-- CreateIndex
CREATE INDEX "study_sessions_user_id_created_at_idx" ON "study_sessions"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_object_id_fkey" FOREIGN KEY ("object_id") REFERENCES "objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "flashcard_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_object_id_fkey" FOREIGN KEY ("object_id") REFERENCES "objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Ràng buộc toàn vẹn Trụ Học tập
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_minutes_range" CHECK (minutes BETWEEN 1 AND 240);
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_ease_min" CHECK (ease_factor >= 1.3);
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_nonneg" CHECK (interval_days >= 0 AND repetitions >= 0);
