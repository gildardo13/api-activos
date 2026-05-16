/*
  Warnings:

  - A unique constraint covering the columns `[vacationId,year]` on the table `DaysPerYearVacations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DaysPerYearVacations_vacationId_year_key" ON "DaysPerYearVacations"("vacationId", "year");
