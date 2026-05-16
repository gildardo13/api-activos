-- CreateTable
CREATE TABLE "StaffDocuments" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "StaffDocuments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StaffDocuments" ADD CONSTRAINT "StaffDocuments_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffDocuments" ADD CONSTRAINT "StaffDocuments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
