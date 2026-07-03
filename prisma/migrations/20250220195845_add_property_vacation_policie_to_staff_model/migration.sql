/*
  Warnings:

  - Added the required column `vacationPolicieId` to the `Staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vacationPoliciesId` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "vacationPolicieId" TEXT NOT NULL,
ADD COLUMN     "vacationPoliciesId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_vacationPoliciesId_fkey" FOREIGN KEY ("vacationPoliciesId") REFERENCES "VacationPolicies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
