/*
  Warnings:

  - You are about to drop the column `descripcion` on the `CostCenters` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CostCenters" DROP COLUMN "descripcion",
ADD COLUMN     "description" TEXT;
