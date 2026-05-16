/*
  Warnings:

  - You are about to drop the column `breakDays` on the `Staff` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EmploymentDetails" ADD COLUMN     "breakDays" TEXT[];

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "breakDays";
