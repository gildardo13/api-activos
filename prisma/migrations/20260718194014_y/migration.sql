-- CreateTable
CREATE TABLE "AssetFolder" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetFile" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssetFolder_assetId_idx" ON "AssetFolder"("assetId");

-- CreateIndex
CREATE INDEX "AssetFolder_parentId_idx" ON "AssetFolder"("parentId");

-- CreateIndex
CREATE INDEX "AssetFile_folderId_idx" ON "AssetFile"("folderId");

-- AddForeignKey
ALTER TABLE "AssetFolder" ADD CONSTRAINT "AssetFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AssetFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetFolder" ADD CONSTRAINT "AssetFolder_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetFile" ADD CONSTRAINT "AssetFile_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "AssetFolder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
