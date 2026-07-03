/*
  Warnings:

  - You are about to drop the `NewIncidentsSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NewIncidentsSettings" DROP CONSTRAINT "NewIncidentsSettings_incidentCategoryId_fkey";

-- DropTable
DROP TABLE "NewIncidentsSettings";

-- CreateTable
CREATE TABLE "IncidentsSettings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "incidentCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentsSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IncidentsSettings_name_key" ON "IncidentsSettings"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentsSettings_name_incidentCategoryId_key" ON "IncidentsSettings"("name", "incidentCategoryId");

-- AddForeignKey
ALTER TABLE "IncidentsSettings" ADD CONSTRAINT "IncidentsSettings_incidentCategoryId_fkey" FOREIGN KEY ("incidentCategoryId") REFERENCES "IncidentCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
