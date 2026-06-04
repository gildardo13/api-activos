/*
  Warnings:

  - The `coordinates` column on the `AssetGeofence` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AssetGeofence" DROP COLUMN "coordinates",
ADD COLUMN     "coordinates" JSONB DEFAULT '[]';
