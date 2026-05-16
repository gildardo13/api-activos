-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "reportsToId" INTEGER;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_reportsToId_fkey" FOREIGN KEY ("reportsToId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
