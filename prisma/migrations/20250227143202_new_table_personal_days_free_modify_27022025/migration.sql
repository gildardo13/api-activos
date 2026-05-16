/*
  Warnings:

  - You are about to drop the column `accumulateDays` on the `PersonalDays` table. All the data in the column will be lost.
  - You are about to drop the column `accumulateDaysExpiry` on the `PersonalDays` table. All the data in the column will be lost.
  - You are about to drop the column `accumulateDaysLimit` on the `PersonalDays` table. All the data in the column will be lost.
  - You are about to drop the column `borrowedDays` on the `PersonalDays` table. All the data in the column will be lost.
  - You are about to drop the column `expiryMonth` on the `PersonalDays` table. All the data in the column will be lost.
  - You are about to drop the column `renewalPeriod` on the `PersonalDays` table. All the data in the column will be lost.
  - You are about to drop the column `withoutLimit` on the `PersonalDays` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PersonalDays" DROP COLUMN "accumulateDays",
DROP COLUMN "accumulateDaysExpiry",
DROP COLUMN "accumulateDaysLimit",
DROP COLUMN "borrowedDays",
DROP COLUMN "expiryMonth",
DROP COLUMN "renewalPeriod",
DROP COLUMN "withoutLimit";
