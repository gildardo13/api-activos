/*
  Warnings:

  - The `categoryId` column on the `AssetType` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `JibbyCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssetType" DROP CONSTRAINT "AssetType_categoryId_fkey";

-- AlterTable
ALTER TABLE "AssetType" DROP COLUMN "categoryId",
ADD COLUMN     "categoryId" JSONB;

-- DropTable
DROP TABLE "JibbyCategory";

-- CreateIndex
CREATE INDEX "AssetType_categoryId_idx" ON "AssetType"("categoryId");
