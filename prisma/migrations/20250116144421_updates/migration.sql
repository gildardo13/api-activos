/*
  Warnings:

  - You are about to drop the column `estatus` on the `CostCenters` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CostCenters" DROP COLUMN "estatus",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';
