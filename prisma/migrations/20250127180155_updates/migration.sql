/*
  Warnings:

  - A unique constraint covering the columns `[rfc]` on the table `Staff` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rfc` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "rfc" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Staff_rfc_key" ON "Staff"("rfc");
