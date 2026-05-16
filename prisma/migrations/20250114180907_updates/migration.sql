-- DropForeignKey
ALTER TABLE "Area" DROP CONSTRAINT "Area_managerId_fkey";

-- AlterTable
ALTER TABLE "Area" ALTER COLUMN "managerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
