-- CreateTable
CREATE TABLE "chapters" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "short_description" VARCHAR(255) NOT NULL,
    "island_group" VARCHAR(50) NOT NULL,
    "region" VARCHAR(50) NOT NULL,
    "overview" TEXT NOT NULL,
    "mission" TEXT,
    "vision" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "created_by" VARCHAR(255),
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(0),

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapter_images" (
    "id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "chapter_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapter_documents" (
    "id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,

    CONSTRAINT "chapter_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapter_officers" (
    "id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category_type" VARCHAR(100) NOT NULL,
    "year_joined" VARCHAR(50) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapter_officers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapter_activities" (
    "id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "image_url" VARCHAR(255),

    CONSTRAINT "chapter_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapter_announcements" (
    "id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "chapter_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chapters_slug_key" ON "chapters"("slug");

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
