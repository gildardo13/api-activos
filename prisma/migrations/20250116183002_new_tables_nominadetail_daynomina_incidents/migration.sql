-- CreateTable
CREATE TABLE "NominaDetail" (
    "id" TEXT NOT NULL,
    "nominaId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "NominaDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayNomina" (
    "id" TEXT NOT NULL,
    "nominaDetailId" TEXT NOT NULL,
    "dateDN" TIMESTAMP(3) NOT NULL,
    "hoursExtras" INTEGER DEFAULT 0,

    CONSTRAINT "DayNomina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incidents" (
    "id" TEXT NOT NULL,
    "dayNominaId" TEXT NOT NULL,
    "incident" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Incidents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NominaDetail_nominaId_staffId_key" ON "NominaDetail"("nominaId", "staffId");

-- CreateIndex
CREATE UNIQUE INDEX "DayNomina_nominaDetailId_dateDN_key" ON "DayNomina"("nominaDetailId", "dateDN");

-- AddForeignKey
ALTER TABLE "NominaDetail" ADD CONSTRAINT "NominaDetail_nominaId_fkey" FOREIGN KEY ("nominaId") REFERENCES "Nomina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NominaDetail" ADD CONSTRAINT "NominaDetail_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayNomina" ADD CONSTRAINT "DayNomina_nominaDetailId_fkey" FOREIGN KEY ("nominaDetailId") REFERENCES "NominaDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidents" ADD CONSTRAINT "Incidents_dayNominaId_fkey" FOREIGN KEY ("dayNominaId") REFERENCES "DayNomina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
