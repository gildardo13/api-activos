/*
  Warnings:

  - You are about to drop the column `orderBy` on the `AssetFieldDefinition` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AssetFieldDefinition" DROP COLUMN "orderBy",
ADD COLUMN     "position" INTEGER;

-- AlterTable
ALTER TABLE "AssetType" ADD COLUMN     "metadata" JSONB;
