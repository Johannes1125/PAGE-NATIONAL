/*
  Warnings:

  - The primary key for the `chapter_activities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `chapter_announcements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `chapter_documents` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `chapter_images` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `chapter_officers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `chapters` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `status` on the `chapters` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(20)`.
  - The `created_by` column on the `chapters` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updated_by` column on the `chapters` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `year_joined` on the `chapter_officers` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "chapter_activities" DROP CONSTRAINT "chapter_activities_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "chapter_announcements" DROP CONSTRAINT "chapter_announcements_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "chapter_documents" DROP CONSTRAINT "chapter_documents_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "chapter_images" DROP CONSTRAINT "chapter_images_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "chapter_officers" DROP CONSTRAINT "chapter_officers_chapter_id_fkey";

-- AlterTable
ALTER TABLE "chapter_activities" DROP CONSTRAINT "chapter_activities_pkey",
ADD COLUMN     "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "chapter_id" SET DATA TYPE TEXT,
ALTER COLUMN "image_url" SET DATA TYPE VARCHAR(500),
ADD CONSTRAINT "chapter_activities_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "chapter_announcements" DROP CONSTRAINT "chapter_announcements_pkey",
ADD COLUMN     "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "chapter_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "chapter_announcements_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "chapter_documents" DROP CONSTRAINT "chapter_documents_pkey",
ADD COLUMN     "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "chapter_id" SET DATA TYPE TEXT,
ALTER COLUMN "file_url" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "file_type" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "chapter_documents_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "chapter_images" DROP CONSTRAINT "chapter_images_pkey",
ADD COLUMN     "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "chapter_id" SET DATA TYPE TEXT,
ALTER COLUMN "file_url" SET DATA TYPE VARCHAR(500),
ADD CONSTRAINT "chapter_images_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "chapter_officers" DROP CONSTRAINT "chapter_officers_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "chapter_id" SET DATA TYPE TEXT,
DROP COLUMN "year_joined",
ADD COLUMN     "year_joined" INTEGER NOT NULL,
ADD CONSTRAINT "chapter_officers_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "chapters" DROP CONSTRAINT "chapters_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "short_description" SET DATA TYPE TEXT,
ALTER COLUMN "region" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "status" SET DATA TYPE VARCHAR(20),
DROP COLUMN "created_by",
ADD COLUMN     "created_by" BIGINT,
DROP COLUMN "updated_by",
ADD COLUMN     "updated_by" BIGINT,
ADD CONSTRAINT "chapters_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "chapter_activities_chapter_id_idx" ON "chapter_activities"("chapter_id");

-- CreateIndex
CREATE INDEX "chapter_announcements_chapter_id_idx" ON "chapter_announcements"("chapter_id");

-- CreateIndex
CREATE INDEX "chapter_documents_chapter_id_idx" ON "chapter_documents"("chapter_id");

-- CreateIndex
CREATE INDEX "chapter_images_chapter_id_idx" ON "chapter_images"("chapter_id");

-- CreateIndex
CREATE INDEX "chapter_officers_chapter_id_idx" ON "chapter_officers"("chapter_id");

-- CreateIndex
CREATE INDEX "chapters_status_idx" ON "chapters"("status");

-- CreateIndex
CREATE INDEX "chapters_island_group_idx" ON "chapters"("island_group");

-- CreateIndex
CREATE INDEX "chapters_slug_idx" ON "chapters"("slug");

-- AddForeignKey
ALTER TABLE "chapter_images" ADD CONSTRAINT "chapter_images_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_documents" ADD CONSTRAINT "chapter_documents_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_officers" ADD CONSTRAINT "chapter_officers_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_activities" ADD CONSTRAINT "chapter_activities_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_announcements" ADD CONSTRAINT "chapter_announcements_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
