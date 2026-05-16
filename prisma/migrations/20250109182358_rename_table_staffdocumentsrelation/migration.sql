/*
  Warnings:

  - You are about to drop the `StaffDocuments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StaffDocuments" DROP CONSTRAINT "StaffDocuments_documentId_fkey";

-- DropForeignKey
ALTER TABLE "StaffDocuments" DROP CONSTRAINT "StaffDocuments_staffId_fkey";

-- DropTable
DROP TABLE "StaffDocuments";

-- CreateTable
CREATE TABLE "StaffDocumentsRelation" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "StaffDocumentsRelation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StaffDocumentsRelation" ADD CONSTRAINT "StaffDocumentsRelation_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffDocumentsRelation" ADD CONSTRAINT "StaffDocumentsRelation_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
