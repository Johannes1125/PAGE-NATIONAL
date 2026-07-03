-- AlterTable: migrate convention_date to start_date/end_date
ALTER TABLE "conventions" ADD COLUMN "start_date" DATE;
ALTER TABLE "conventions" ADD COLUMN "end_date" DATE;

UPDATE "conventions" SET "start_date" = "convention_date", "end_date" = "convention_date";

ALTER TABLE "conventions" ALTER COLUMN "start_date" SET NOT NULL;
ALTER TABLE "conventions" ALTER COLUMN "end_date" SET NOT NULL;

UPDATE "conventions" SET "description" = '' WHERE "description" IS NULL;
ALTER TABLE "conventions" ALTER COLUMN "description" SET NOT NULL;

ALTER TABLE "conventions" DROP COLUMN "convention_date";
ALTER TABLE "conventions" DROP COLUMN "banner_url";

-- CreateTable
CREATE TABLE "convention_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "convention_id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convention_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "convention_schedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "convention_id" UUID NOT NULL,
    "schedule_date" DATE NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "event_type" VARCHAR(255) NOT NULL,
    "start_time" VARCHAR(50),
    "end_time" VARCHAR(50),
    "location" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convention_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "convention_speakers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "convention_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role_position" VARCHAR(255) NOT NULL,
    "institution" VARCHAR(255) NOT NULL,
    "presentation_topic" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convention_speakers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "convention_attachments_convention_id_idx" ON "convention_attachments"("convention_id");

-- CreateIndex
CREATE INDEX "convention_schedules_convention_id_idx" ON "convention_schedules"("convention_id");

-- CreateIndex
CREATE INDEX "convention_speakers_convention_id_idx" ON "convention_speakers"("convention_id");

-- AddForeignKey
ALTER TABLE "convention_attachments" ADD CONSTRAINT "convention_attachments_convention_id_fkey" FOREIGN KEY ("convention_id") REFERENCES "conventions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convention_schedules" ADD CONSTRAINT "convention_schedules_convention_id_fkey" FOREIGN KEY ("convention_id") REFERENCES "conventions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convention_speakers" ADD CONSTRAINT "convention_speakers_convention_id_fkey" FOREIGN KEY ("convention_id") REFERENCES "conventions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
