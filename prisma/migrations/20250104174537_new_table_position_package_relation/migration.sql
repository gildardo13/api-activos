/*
  Warnings:

  - You are about to drop the column `packageId` on the `Position` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_packageId_fkey";

-- AlterTable
ALTER TABLE "Position" DROP COLUMN "packageId";

-- CreateTable
CREATE TABLE "PositionPackageRelation" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,

    CONSTRAINT "PositionPackageRelation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PositionPackageRelation" ADD CONSTRAINT "PositionPackageRelation_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionPackageRelation" ADD CONSTRAINT "PositionPackageRelation_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
