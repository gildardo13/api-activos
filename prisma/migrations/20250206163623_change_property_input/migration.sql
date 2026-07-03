/*
  Warnings:

  - You are about to alter the column `percent` on the `StaffBeneficiaries` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "StaffBeneficiaries" ALTER COLUMN "percent" SET DATA TYPE INTEGER;
