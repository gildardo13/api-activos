/*
  Warnings:

  - The primary key for the `Staff` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Staff_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Staff_id_seq";
