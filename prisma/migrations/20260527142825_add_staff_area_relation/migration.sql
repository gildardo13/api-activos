-- AlterTable
ALTER TABLE "RhStaff" ADD COLUMN     "idArea" TEXT;

-- AddForeignKey
ALTER TABLE "RhStaff" ADD CONSTRAINT "RhStaff_idArea_fkey" FOREIGN KEY ("idArea") REFERENCES "RhArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
