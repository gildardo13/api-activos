/*
  Warnings:

  - You are about to drop the column `packagesId` on the `DocumentPackages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DocumentPackages" DROP CONSTRAINT "DocumentPackages_packagesId_fkey";

-- AlterTable
ALTER TABLE "DocumentPackages" DROP COLUMN "packagesId";

-- AddForeignKey
ALTER TABLE "DocumentPackages" ADD CONSTRAINT "DocumentPackages_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
