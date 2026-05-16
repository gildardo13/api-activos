/*
  Warnings:

  - Added the required column `parentCostCenterId` to the `Subarea` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subarea" ADD COLUMN     "parentCostCenterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Subarea" ADD CONSTRAINT "Subarea_parentCostCenterId_fkey" FOREIGN KEY ("parentCostCenterId") REFERENCES "CostCenters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
