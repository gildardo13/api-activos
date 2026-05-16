/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Area` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[key]` on the table `Subarea` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Area" ADD COLUMN     "key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Area_key_key" ON "Area"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Subarea_key_key" ON "Subarea"("key");
