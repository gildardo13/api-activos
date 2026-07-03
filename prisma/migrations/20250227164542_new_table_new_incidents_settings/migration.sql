-- CreateTable
CREATE TABLE "NewIncidentsSettings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "incidentCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewIncidentsSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentCategories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentCategories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewIncidentsSettings_name_key" ON "NewIncidentsSettings"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NewIncidentsSettings_name_incidentCategoryId_key" ON "NewIncidentsSettings"("name", "incidentCategoryId");

-- AddForeignKey
ALTER TABLE "NewIncidentsSettings" ADD CONSTRAINT "NewIncidentsSettings_incidentCategoryId_fkey" FOREIGN KEY ("incidentCategoryId") REFERENCES "IncidentCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
