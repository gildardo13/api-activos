-- CreateTable
CREATE TABLE "Nomina" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "areaId" TEXT NOT NULL,

    CONSTRAINT "Nomina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NominaCostCenters" (
    "id" TEXT NOT NULL,
    "nominaId" TEXT NOT NULL,
    "costCenterId" TEXT NOT NULL,

    CONSTRAINT "NominaCostCenters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Nomina_id_key" ON "Nomina"("id");

-- CreateIndex
CREATE UNIQUE INDEX "NominaCostCenters_id_key" ON "NominaCostCenters"("id");

-- AddForeignKey
ALTER TABLE "NominaCostCenters" ADD CONSTRAINT "NominaCostCenters_nominaId_fkey" FOREIGN KEY ("nominaId") REFERENCES "Nomina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NominaCostCenters" ADD CONSTRAINT "NominaCostCenters_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
