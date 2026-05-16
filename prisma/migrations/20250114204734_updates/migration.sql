/*
  Warnings:

  - Added the required column `costCenterId` to the `Area` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Area" ADD COLUMN     "costCenterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
