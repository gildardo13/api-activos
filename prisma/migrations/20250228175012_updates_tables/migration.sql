/*
  Warnings:

  - You are about to drop the column `metadatada` on the `DocumentApprovals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocumentApprovals" DROP COLUMN "metadatada",
ADD COLUMN     "metadata" JSONB;
