-- DropForeignKey
ALTER TABLE "DocumentApprovals" DROP CONSTRAINT "DocumentApprovals_positionId_fkey";

-- AlterTable
ALTER TABLE "DocumentApprovals" ALTER COLUMN "positionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DocumentApprovals" ADD CONSTRAINT "DocumentApprovals_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
