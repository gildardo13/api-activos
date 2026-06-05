-- CreateEnum
CREATE TYPE "ClasificationType" AS ENUM ('MOVABLE', 'INMOVABLE');

-- AlterTable
ALTER TABLE "AssetType" ADD COLUMN     "clasificationType" "ClasificationType";
