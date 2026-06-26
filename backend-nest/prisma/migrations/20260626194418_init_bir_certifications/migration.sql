-- CreateTable
CREATE TABLE "bir_certifications" (
    "id" TEXT NOT NULL,
    "registrationName" TEXT NOT NULL,
    "tinNumber" TEXT NOT NULL,
    "certificationNumber" TEXT NOT NULL,
    "exemptionCategory" TEXT NOT NULL,
    "dateOfIssuance" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bir_certifications_pkey" PRIMARY KEY ("id")
);
