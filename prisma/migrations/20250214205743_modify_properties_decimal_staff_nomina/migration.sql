/*
  Warnings:

  - You are about to alter the column `netSalary` on the `StaffNomina` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.
  - You are about to alter the column `grossSalary` on the `StaffNomina` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.

*/
-- AlterTable
ALTER TABLE "StaffNomina" ALTER COLUMN "netSalary" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "grossSalary" SET DATA TYPE DECIMAL(18,2);
