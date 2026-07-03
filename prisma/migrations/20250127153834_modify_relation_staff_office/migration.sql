/*
  Warnings:

  - You are about to drop the column `officeId` on the `Position` table. All the data in the column will be lost.
  - Added the required column `officeId` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_officeId_fkey";

-- AlterTable
ALTER TABLE "Position" DROP COLUMN "officeId";

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "officeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
