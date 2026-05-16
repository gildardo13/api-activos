/*
  Warnings:

  - A unique constraint covering the columns `[packageId]` on the table `PositionPackageRelation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PositionPackageRelation_packageId_key" ON "PositionPackageRelation"("packageId");
