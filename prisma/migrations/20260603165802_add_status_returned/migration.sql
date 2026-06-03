/*
  Warnings:

  - The `staffId` column on the `AssetAssignment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `areaId` column on the `AssetAssignment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `RhArea` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RhStaff` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssetAssignment" DROP CONSTRAINT "AssetAssignment_areaId_fkey";

-- DropForeignKey
ALTER TABLE "AssetAssignment" DROP CONSTRAINT "AssetAssignment_staffId_fkey";

-- DropForeignKey
ALTER TABLE "RhStaff" DROP CONSTRAINT "RhStaff_idArea_fkey";

-- AlterTable
ALTER TABLE "AssetAssignment" DROP COLUMN "staffId",
ADD COLUMN     "staffId" JSONB,
DROP COLUMN "areaId",
ADD COLUMN     "areaId" JSONB;

-- DropTable
DROP TABLE "RhArea";

-- DropTable
DROP TABLE "RhStaff";

-- CreateIndex
CREATE INDEX "AssetAssignment_staffId_idx" ON "AssetAssignment"("staffId");

-- CreateIndex
CREATE INDEX "AssetAssignment_areaId_idx" ON "AssetAssignment"("areaId");
