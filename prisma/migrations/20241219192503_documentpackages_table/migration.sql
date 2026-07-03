-- CreateTable
CREATE TABLE "Packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentPackages" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "packagesId" TEXT NOT NULL,

    CONSTRAINT "DocumentPackages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Packages_name_key" ON "Packages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentPackages_documentId_packageId_key" ON "DocumentPackages"("documentId", "packageId");

-- AddForeignKey
ALTER TABLE "DocumentPackages" ADD CONSTRAINT "DocumentPackages_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackages" ADD CONSTRAINT "DocumentPackages_packagesId_fkey" FOREIGN KEY ("packagesId") REFERENCES "Packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
