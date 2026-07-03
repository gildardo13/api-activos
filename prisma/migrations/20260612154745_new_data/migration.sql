-- CreateEnum
CREATE TYPE "StatusApproval" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "statusApproval" "StatusApproval";

-- AlterTable
ALTER TABLE "AssetAssignment" ADD COLUMN     "statusApproval" "StatusApproval";

-- AlterTable
ALTER TABLE "AssetDocument" ADD COLUMN     "statusApproval" "StatusApproval";
