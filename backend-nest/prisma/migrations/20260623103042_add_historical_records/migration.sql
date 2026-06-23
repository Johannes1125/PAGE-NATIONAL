-- CreateTable
CREATE TABLE "historical_records" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "yearStart" INTEGER NOT NULL,
    "programType" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historical_records_pkey" PRIMARY KEY ("id")
);
