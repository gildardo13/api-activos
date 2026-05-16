/*
  Warnings:

  - Added the required column `managerId` to the `Area` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Area" ADD COLUMN     "managerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
