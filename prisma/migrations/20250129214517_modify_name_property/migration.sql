/*
  Warnings:

  - You are about to drop the column `detailsId` on the `Staff` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "detailsId",
ADD COLUMN     "employmentDetailsId" TEXT;
