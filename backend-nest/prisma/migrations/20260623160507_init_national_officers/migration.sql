-- CreateTable
CREATE TABLE "NationalOfficer" (
    "id" TEXT NOT NULL,
    "memberName" TEXT NOT NULL,
    "positionCategory" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NationalOfficer_pkey" PRIMARY KEY ("id")
);
