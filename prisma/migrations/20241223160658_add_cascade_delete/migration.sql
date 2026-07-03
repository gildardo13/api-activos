-- DropForeignKey
ALTER TABLE "DocumentPackages" DROP CONSTRAINT "DocumentPackages_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPackages" DROP CONSTRAINT "DocumentPackages_packageId_fkey";

-- AddForeignKey
ALTER TABLE "DocumentPackages" ADD CONSTRAINT "DocumentPackages_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPackages" ADD CONSTRAINT "DocumentPackages_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
