/*
  Warnings:

  - You are about to drop the column `key` on the `Area` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Area" DROP COLUMN "key";

-- AlterTable
ALTER TABLE "Subarea" ADD COLUMN     "key" TEXT;
