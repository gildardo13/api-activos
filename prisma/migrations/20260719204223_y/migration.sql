-- CreateTable
CREATE TABLE "asset_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AssetToAssetGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "asset_groups_name_key" ON "asset_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "asset_groups_code_key" ON "asset_groups"("code");

-- CreateIndex
CREATE INDEX "asset_groups_status_idx" ON "asset_groups"("status");

-- CreateIndex
CREATE UNIQUE INDEX "_AssetToAssetGroup_AB_unique" ON "_AssetToAssetGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_AssetToAssetGroup_B_index" ON "_AssetToAssetGroup"("B");

-- AddForeignKey
ALTER TABLE "_AssetToAssetGroup" ADD CONSTRAINT "_AssetToAssetGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssetToAssetGroup" ADD CONSTRAINT "_AssetToAssetGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "asset_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
