/*
  Warnings:

  - You are about to drop the column `metadata` on the `catalog_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "catalog_items" DROP COLUMN "metadata",
ADD COLUMN     "config" JSONB;
