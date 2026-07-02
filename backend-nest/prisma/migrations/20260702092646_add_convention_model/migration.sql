-- CreateTable
CREATE TABLE "conventions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "convention_number" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "convention_date" DATE NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "banner_url" TEXT,
    "description" TEXT,
    "created_by" BIGINT,
    "updated_by" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ(6),

    CONSTRAINT "conventions_pkey" PRIMARY KEY ("id")
);

-- Add CHECK constraint
ALTER TABLE "conventions" ADD CONSTRAINT "status_check" CHECK ("status" IN ('draft', 'published'));

