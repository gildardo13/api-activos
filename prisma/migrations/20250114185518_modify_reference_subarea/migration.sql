/*
  Warnings:

  - You are about to drop the column `childrenSubareaId` on the `Subarea` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Subarea" DROP CONSTRAINT "Subarea_childrenSubareaId_fkey";

-- AlterTable
ALTER TABLE "Subarea" DROP COLUMN "childrenSubareaId";
