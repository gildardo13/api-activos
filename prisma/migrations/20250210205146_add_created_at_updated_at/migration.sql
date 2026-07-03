/*
  Warnings:

  - Added the required column `updatedAt` to the `EmergencyContacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StaffBankData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StaffBeneficiaries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StaffNomina` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmergencyContacts" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StaffBankData" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StaffBeneficiaries" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StaffNomina" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
