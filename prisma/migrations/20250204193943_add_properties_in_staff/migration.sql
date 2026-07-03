/*
  Warnings:

  - A unique constraint covering the columns `[nss]` on the table `Staff` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "breakDays" TEXT[],
ADD COLUMN     "nss" TEXT,
ADD COLUMN     "numberCard" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "Staff_nss_key" ON "Staff"("nss");
