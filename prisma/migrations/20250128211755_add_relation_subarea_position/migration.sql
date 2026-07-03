/*
  Warnings:

  - Added the required column `updatedAt` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "subareaId" TEXT;

-- AlterTable
-- ALTER TABLE "Staff" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
-- ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_subareaId_fkey" FOREIGN KEY ("subareaId") REFERENCES "Subarea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
