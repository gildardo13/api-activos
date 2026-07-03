-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "commentsApproval" TEXT;

-- AlterTable
ALTER TABLE "AssetAssignment" ADD COLUMN     "commentsApproval" TEXT;

-- AlterTable
ALTER TABLE "AssetDocument" ADD COLUMN     "commentsApproval" TEXT;
