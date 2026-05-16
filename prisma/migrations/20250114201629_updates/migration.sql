-- CreateTable
CREATE TABLE "CostCenters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "descripcion" TEXT,
    "estatus" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "CostCenters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CostCenters_name_key" ON "CostCenters"("name");
