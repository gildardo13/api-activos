/*
  Warnings:

  - You are about to drop the column `aut` on the `DocumentApprovals` table. All the data in the column will be lost.
  - You are about to drop the column `estatus` on the `DocumentApprovals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocumentApprovals" DROP COLUMN "aut",
DROP COLUMN "estatus",
ADD COLUMN     "approval" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'En espera';
