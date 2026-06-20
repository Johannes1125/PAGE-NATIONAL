-- CreateTable
CREATE TABLE "about_page_sections" (
    "id" UUID NOT NULL,
    "section_key" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "status" VARCHAR(255) NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(0),

    CONSTRAINT "about_page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_page_officers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "position" VARCHAR(255) NOT NULL,
    "chapter" VARCHAR(255),
    "photo_url" VARCHAR(255),
    "term_start" VARCHAR(255),
    "term_end" VARCHAR(255),
    "status" VARCHAR(255) NOT NULL DEFAULT 'active',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "about_page_officers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "about_page_documents" (
    "id" UUID NOT NULL,
    "section_key" VARCHAR(255) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "about_page_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "about_page_sections_section_key_key" ON "about_page_sections"("section_key");
