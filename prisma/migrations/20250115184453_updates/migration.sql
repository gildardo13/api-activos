/*
  Warnings:

  - Added the required column `costCenterId` to the `Subarea` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subarea" ADD COLUMN     "costCenterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Subarea" ADD CONSTRAINT "Subarea_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
