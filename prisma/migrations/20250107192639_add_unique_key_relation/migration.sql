/*
  Warnings:

  - A unique constraint covering the columns `[positionId,packageId]` on the table `PositionPackageRelation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PositionPackageRelation_packageId_key";

-- CreateIndex
CREATE UNIQUE INDEX "PositionPackageRelation_positionId_packageId_key" ON "PositionPackageRelation"("positionId", "packageId");
