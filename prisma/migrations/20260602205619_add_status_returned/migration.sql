/*
  Warnings:

  - You are about to drop the `RhArea` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RhStaff` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssetAssignment" DROP CONSTRAINT "AssetAssignment_areaId_fkey";

-- DropForeignKey
ALTER TABLE "AssetAssignment" DROP CONSTRAINT "AssetAssignment_staffId_fkey";

-- DropForeignKey
ALTER TABLE "RhStaff" DROP CONSTRAINT "RhStaff_idArea_fkey";

-- DropIndex
DROP INDEX "AssetAssignment_areaId_idx";

-- DropIndex
DROP INDEX "AssetAssignment_staffId_idx";

-- DropTable
DROP TABLE "RhArea";

-- DropTable
DROP TABLE "RhStaff";
