-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "staffId" TEXT,
ALTER COLUMN "value" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
