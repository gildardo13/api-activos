/*
  Warnings:

  - A unique constraint covering the columns `[nominaId,costCenterId]` on the table `NominaCostCenters` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NominaCostCenters_nominaId_costCenterId_key" ON "NominaCostCenters"("nominaId", "costCenterId");
