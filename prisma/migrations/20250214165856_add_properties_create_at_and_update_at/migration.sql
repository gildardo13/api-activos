/*
  Warnings:

  - Added the required column `updatedAt` to the `CostCenters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DayNomina` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DaysPerYearVacations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EmploymentDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Incidents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Nomina` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `NominaConcept` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `NominaCostCenters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `NominaDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PositionDocumentsRelation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PositionPackageRelation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StaffAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StaffDataPrivate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StaffDocumentsDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StaffDocumentsRelation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StaffFiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VacationPolicies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CostCenters" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DayNomina" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DaysPerYearVacations" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "EmploymentDetails" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Incidents" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Nomina" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "NominaConcept" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "NominaCostCenters" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "NominaDetail" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PositionDocumentsRelation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PositionPackageRelation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StaffAddress" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StaffDataPrivate" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StaffDocumentsDetails" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StaffDocumentsRelation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StaffFiles" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "VacationPolicies" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
