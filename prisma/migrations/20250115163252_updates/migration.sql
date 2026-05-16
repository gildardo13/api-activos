/*
  Warnings:

  - You are about to drop the column `customArea` on the `Subarea` table. All the data in the column will be lost.
  - Added the required column `customCostCenter` to the `Subarea` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subarea" DROP COLUMN "customArea",
ADD COLUMN     "customCostCenter" BOOLEAN NOT NULL;
