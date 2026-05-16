/*
  Warnings:

  - A unique constraint covering the columns `[level]` on the table `Level` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Area` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Area" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Level_level_key" ON "Level"("level");
