/*
  Warnings:

  - Added the required column `vacationPolicieId` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "vacationPolicieId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_vacationPolicieId_fkey" FOREIGN KEY ("vacationPolicieId") REFERENCES "VacationPolicies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
