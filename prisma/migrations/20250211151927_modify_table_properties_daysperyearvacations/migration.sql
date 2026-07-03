-- CreateTable
CREATE TABLE "VacationPolicies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "renewalType" TEXT NOT NULL,
    "renewalPeriod" TEXT NOT NULL,
    "accumulateDays" BOOLEAN NOT NULL,
    "borrowedDays" BOOLEAN NOT NULL,

    CONSTRAINT "VacationPolicies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DaysPerYearVacations" (
    "id" TEXT NOT NULL,
    "vacationId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "days" INTEGER NOT NULL,

    CONSTRAINT "DaysPerYearVacations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DaysPerYearVacations_vacationId_key" ON "DaysPerYearVacations"("vacationId");

-- AddForeignKey
ALTER TABLE "DaysPerYearVacations" ADD CONSTRAINT "DaysPerYearVacations_vacationId_fkey" FOREIGN KEY ("vacationId") REFERENCES "VacationPolicies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
