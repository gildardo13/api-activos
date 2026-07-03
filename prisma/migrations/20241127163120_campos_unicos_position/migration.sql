/*
  Warnings:

  - A unique constraint covering the columns `[name,areaId]` on the table `Position` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Position_name_areaId_key" ON "Position"("name", "areaId");
