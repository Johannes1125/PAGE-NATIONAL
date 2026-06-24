-- CreateTable
CREATE TABLE "SecRegistration" (
    "id" TEXT NOT NULL,
    "registrationName" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "dateOfIncorporation" TIMESTAMP(3) NOT NULL,
    "exemptionCategory" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecRegistration_pkey" PRIMARY KEY ("id")
);
