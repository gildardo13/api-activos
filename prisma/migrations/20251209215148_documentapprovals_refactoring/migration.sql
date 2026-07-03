/*
  Warnings:

  - You are about to drop the column `cancellationReason` on the `DocumentApprovals` table. All the data in the column will be lost.
  - You are about to drop the column `device` on the `DocumentApprovals` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `DocumentApprovals` table. All the data in the column will be lost.
  - You are about to drop the column `ip` on the `DocumentApprovals` table. All the data in the column will be lost.
  - You are about to drop the column `positionId` on the `DocumentApprovals` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DocumentApprovals" DROP CONSTRAINT "DocumentApprovals_positionId_fkey";

-- AlterTable
ALTER TABLE "DocumentApprovals" DROP COLUMN "cancellationReason",
DROP COLUMN "device",
DROP COLUMN "email",
DROP COLUMN "ip",
DROP COLUMN "positionId",
ADD COLUMN     "approvalFlow" JSONB;
