-- CreateTable
CREATE TABLE "cbl_articles" (
    "id" UUID NOT NULL,
    "article_number" VARCHAR(255) NOT NULL,
    "article_name" VARCHAR(255) NOT NULL,
    "article_description" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cbl_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cbl_governance_documents" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "general_description" TEXT NOT NULL,
    "file_name" VARCHAR(255),
    "file_url" VARCHAR(255),
    "file_size" INTEGER,
    "uploaded_by" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cbl_governance_documents_pkey" PRIMARY KEY ("id")
);
