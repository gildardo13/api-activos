/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `IncidentCategories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "IncidentCategories_name_key" ON "IncidentCategories"("name");
