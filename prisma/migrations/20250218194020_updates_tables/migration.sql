/*
  Warnings:

  - Changed the type of `type` on the `NotificationLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'WHATSAPP', 'SMS', 'PUSH_NOTIFICATION', 'SYSTEM_ALERT', 'OTHER');

-- AlterTable
ALTER TABLE "NotificationLog" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;
