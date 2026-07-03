-- CreateEnum
CREATE TYPE "StatusReturn" AS ENUM ('RETURNED', 'IN_USE', 'PENDING');

-- AlterTable
ALTER TABLE "AssetAssignment" ADD COLUMN     "statusReturned" "StatusReturn";
