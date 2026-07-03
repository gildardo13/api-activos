-- AlterTable
ALTER TABLE "Subarea" ADD COLUMN     "childrenSubareaId" TEXT;

-- AddForeignKey
ALTER TABLE "Subarea" ADD CONSTRAINT "Subarea_childrenSubareaId_fkey" FOREIGN KEY ("childrenSubareaId") REFERENCES "Subarea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
