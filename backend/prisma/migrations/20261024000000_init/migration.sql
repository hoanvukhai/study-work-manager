-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ObjectType" AS ENUM ('TASK', 'NOTE', 'EVENT', 'REFERENCE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ObjectLifecycle" AS ENUM ('ACTIVE', 'ARCHIVED', 'TRASH');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('RELATES_TO', 'DEPENDS_ON', 'REFERENCES', 'PARENT_OF');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "avatar_url" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "locked_at" TIMESTAMPTZ,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(50) NOT NULL DEFAULT '📁',
    "color" VARCHAR(20) NOT NULL DEFAULT '#6366f1',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "goal" TEXT,
    "due_date" TIMESTAMPTZ,
    "archived_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objects" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "ObjectType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "TaskStatus",
    "priority" "Priority",
    "lifecycle" "ObjectLifecycle" NOT NULL DEFAULT 'ACTIVE',
    "due_date" TIMESTAMPTZ,
    "start_at" TIMESTAMPTZ,
    "end_at" TIMESTAMPTZ,
    "url" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "archived_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_objects" (
    "id" UUID NOT NULL,
    "space_id" UUID NOT NULL,
    "object_id" UUID NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "added_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "object_relations" (
    "id" UUID NOT NULL,
    "from_object_id" UUID NOT NULL,
    "to_object_id" UUID NOT NULL,
    "relation_type" "RelationType" NOT NULL DEFAULT 'RELATES_TO',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "object_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "object_id" UUID,
    "type" VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "dedupe_key" VARCHAR(100),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "spaces_user_id_archived_at_idx" ON "spaces"("user_id", "archived_at");

-- CreateIndex
CREATE INDEX "objects_user_id_lifecycle_idx" ON "objects"("user_id", "lifecycle");

-- CreateIndex
CREATE INDEX "objects_user_id_type_idx" ON "objects"("user_id", "type");

-- CreateIndex
CREATE INDEX "objects_user_id_due_date_idx" ON "objects"("user_id", "due_date");

-- CreateIndex
CREATE INDEX "objects_user_id_start_at_idx" ON "objects"("user_id", "start_at");

-- CreateIndex
CREATE INDEX "space_objects_space_id_position_idx" ON "space_objects"("space_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "space_objects_space_id_object_id_key" ON "space_objects"("space_id", "object_id");

-- CreateIndex
CREATE INDEX "object_relations_to_object_id_idx" ON "object_relations"("to_object_id");

-- CreateIndex
CREATE UNIQUE INDEX "object_relations_from_object_id_to_object_id_relation_type_key" ON "object_relations"("from_object_id", "to_object_id", "relation_type");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_user_id_dedupe_key_key" ON "notifications"("user_id", "dedupe_key");

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objects" ADD CONSTRAINT "objects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_objects" ADD CONSTRAINT "space_objects_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_objects" ADD CONSTRAINT "space_objects_object_id_fkey" FOREIGN KEY ("object_id") REFERENCES "objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_relations" ADD CONSTRAINT "object_relations_from_object_id_fkey" FOREIGN KEY ("from_object_id") REFERENCES "objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_relations" ADD CONSTRAINT "object_relations_to_object_id_fkey" FOREIGN KEY ("to_object_id") REFERENCES "objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_object_id_fkey" FOREIGN KEY ("object_id") REFERENCES "objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

