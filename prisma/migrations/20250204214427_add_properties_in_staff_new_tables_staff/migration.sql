/*
  Warnings:

  - You are about to drop the column `curp` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `maritalStatus` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `municipality` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `neighborhood` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `nss` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `numberCard` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `rfc` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `Staff` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Staff_email_key";

-- DropIndex
DROP INDEX "Staff_nss_key";

-- DropIndex
DROP INDEX "Staff_rfc_key";

-- AlterTable
ALTER TABLE "EmploymentDetails" ADD COLUMN     "numberCard" TEXT;

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "curp",
DROP COLUMN "email",
DROP COLUMN "maritalStatus",
DROP COLUMN "municipality",
DROP COLUMN "nationality",
DROP COLUMN "neighborhood",
DROP COLUMN "nss",
DROP COLUMN "numberCard",
DROP COLUMN "phone",
DROP COLUMN "postalCode",
DROP COLUMN "rfc",
DROP COLUMN "state",
DROP COLUMN "street";

-- CreateTable
CREATE TABLE "StaffDataPrivate" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "curp" TEXT NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "nss" TEXT,

    CONSTRAINT "StaffDataPrivate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffAddress" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "isFiscal" BOOLEAN NOT NULL DEFAULT false,
    "state" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "colony" TEXT NOT NULL,
    "numberExtern" TEXT,
    "numberIntern" TEXT,

    CONSTRAINT "StaffAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffBankData" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "clabe" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,

    CONSTRAINT "StaffBankData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffNomina" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "netSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastSalaryAdjusment" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "typeContract" TEXT NOT NULL,
    "contractDuration" TEXT NOT NULL,
    "contractEnd" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffNomina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContacts" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "kinship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "EmergencyContacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffDataPrivate_email_key" ON "StaffDataPrivate"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StaffDataPrivate_rfc_key" ON "StaffDataPrivate"("rfc");

-- CreateIndex
CREATE UNIQUE INDEX "StaffDataPrivate_nss_key" ON "StaffDataPrivate"("nss");

-- CreateIndex
CREATE UNIQUE INDEX "StaffDataPrivate_staffId_key" ON "StaffDataPrivate"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffBankData_staffId_key" ON "StaffBankData"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffNomina_staffId_key" ON "StaffNomina"("staffId");

-- AddForeignKey
ALTER TABLE "StaffDataPrivate" ADD CONSTRAINT "StaffDataPrivate_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAddress" ADD CONSTRAINT "StaffAddress_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffBankData" ADD CONSTRAINT "StaffBankData_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffNomina" ADD CONSTRAINT "StaffNomina_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContacts" ADD CONSTRAINT "EmergencyContacts_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
