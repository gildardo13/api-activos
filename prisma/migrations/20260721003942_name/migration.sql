-- DropForeignKey
ALTER TABLE "AssetGeofence" DROP CONSTRAINT "AssetGeofence_assetId_fkey";

-- AlterTable
ALTER TABLE "AssetGeofence" ALTER COLUMN "assetId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "AssetType" ADD COLUMN     "template_design" JSONB;

-- AddForeignKey
ALTER TABLE "AssetGeofence" ADD CONSTRAINT "AssetGeofence_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
