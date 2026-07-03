-- CreateTable
CREATE TABLE "PositionDocumentsRelation" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "PositionDocumentsRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PositionDocumentsRelation_positionId_documentId_key" ON "PositionDocumentsRelation"("positionId", "documentId");

-- AddForeignKey
ALTER TABLE "PositionDocumentsRelation" ADD CONSTRAINT "PositionDocumentsRelation_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionDocumentsRelation" ADD CONSTRAINT "PositionDocumentsRelation_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
