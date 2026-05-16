/*
  Warnings:

  - A unique constraint covering the columns `[staffId,documentId]` on the table `StaffDocumentsRelation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StaffDocumentsRelation_staffId_documentId_key" ON "StaffDocumentsRelation"("staffId", "documentId");
