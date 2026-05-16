-- CreateTable
CREATE TABLE "StaffDocumentsDetails" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "dateValidity" TIMESTAMP(3),
    "documentUrl" TEXT NOT NULL,

    CONSTRAINT "StaffDocumentsDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffDocumentsDetails_staffId_documentId_key" ON "StaffDocumentsDetails"("staffId", "documentId");

-- AddForeignKey
ALTER TABLE "StaffDocumentsDetails" ADD CONSTRAINT "StaffDocumentsDetails_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffDocumentsDetails" ADD CONSTRAINT "StaffDocumentsDetails_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
