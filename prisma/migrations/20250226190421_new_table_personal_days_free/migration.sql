-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "personalDaysId" TEXT;

-- CreateTable
CREATE TABLE "PersonalDays" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "renewalType" TEXT NOT NULL,
    "renewalPeriod" TEXT NOT NULL,
    "accumulateDays" BOOLEAN NOT NULL,
    "accumulateDaysLimit" INTEGER NOT NULL DEFAULT 0,
    "withoutLimit" BOOLEAN NOT NULL,
    "accumulateDaysExpiry" BOOLEAN NOT NULL,
    "expiryMonth" INTEGER NOT NULL DEFAULT 0,
    "borrowedDays" BOOLEAN NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalDays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DaysPerYearPersonal" (
    "id" TEXT NOT NULL,
    "personalDaysId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "days" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DaysPerYearPersonal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DaysPerYearPersonal_personalDaysId_year_key" ON "DaysPerYearPersonal"("personalDaysId", "year");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_personalDaysId_fkey" FOREIGN KEY ("personalDaysId") REFERENCES "PersonalDays"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DaysPerYearPersonal" ADD CONSTRAINT "DaysPerYearPersonal_personalDaysId_fkey" FOREIGN KEY ("personalDaysId") REFERENCES "PersonalDays"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
