/*
  Warnings:

  - You are about to drop the column `vacationPolicieId` on the `Staff` table. All the data in the column will be lost.
  - You are about to drop the column `vacationPoliciesId` on the `Staff` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_vacationPoliciesId_fkey";

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "vacationPolicieId",
DROP COLUMN "vacationPoliciesId";
