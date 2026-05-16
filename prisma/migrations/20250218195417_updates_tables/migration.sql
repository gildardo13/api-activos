/*
  Warnings:

  - You are about to drop the column `medatada` on the `NotificationLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "NotificationLog" DROP COLUMN "medatada",
ADD COLUMN     "metadata" JSONB;
