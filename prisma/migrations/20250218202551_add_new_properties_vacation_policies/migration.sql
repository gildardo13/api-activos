/*
  Warnings:

  - Added the required column `accumulateDaysExpiry` to the `VacationPolicies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `withoutLimit` to the `VacationPolicies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VacationPolicies" ADD COLUMN     "accumulateDaysExpiry" BOOLEAN NOT NULL,
ADD COLUMN     "accumulateDaysLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "expiryMonth" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "withoutLimit" BOOLEAN NOT NULL;
