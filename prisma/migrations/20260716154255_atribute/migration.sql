/*
  Warnings:

  - Added the required column `orderBy` to the `AssetFieldDefinition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetFieldDefinition" ADD COLUMN     "orderBy" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "AssetTelemetryLog" ADD COLUMN     "isActive" BOOLEAN DEFAULT true;

-- CreateTable
CREATE TABLE "ApprovalFlowBody" (
    "id" TEXT NOT NULL,
    "idReference" TEXT NOT NULL,
    "idRequest" TEXT,
    "metadata" JSONB,
    "typeAction" TEXT NOT NULL,
    "statusApproval" "StatusApproval",
    "commentsApproval" TEXT,

    CONSTRAINT "ApprovalFlowBody_pkey" PRIMARY KEY ("id")
);
