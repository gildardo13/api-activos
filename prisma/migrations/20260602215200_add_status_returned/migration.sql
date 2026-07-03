-- CreateTable
CREATE TABLE "RhStaff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "idArea" TEXT,

    CONSTRAINT "RhStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RhArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RhArea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssetAssignment_staffId_idx" ON "AssetAssignment"("staffId");

-- CreateIndex
CREATE INDEX "AssetAssignment_areaId_idx" ON "AssetAssignment"("areaId");

-- AddForeignKey
ALTER TABLE "RhStaff" ADD CONSTRAINT "RhStaff_idArea_fkey" FOREIGN KEY ("idArea") REFERENCES "RhArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "RhStaff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "RhArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
