/*
  Warnings:

  - The `status` column on the `Asset` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StatusAsset" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "status",
ADD COLUMN     "status" "StatusAsset" NOT NULL DEFAULT 'ACTIVE';
