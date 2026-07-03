/*
  Warnings:

  - You are about to drop the column `request_type_assignment_id` on the `requests` table. All the data in the column will be lost.
  - Added the required column `request_type_id` to the `requests` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "requests" DROP CONSTRAINT "requests_request_type_assignment_id_fkey";

-- AlterTable
ALTER TABLE "requests" DROP COLUMN "request_type_assignment_id",
ADD COLUMN     "request_type_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_request_type_id_fkey" FOREIGN KEY ("request_type_id") REFERENCES "request_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
