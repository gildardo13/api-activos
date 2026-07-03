/*
  Warnings:

  - Added the required column `datesWillBe` to the `IncidentsSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileRequired` to the `IncidentsSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUp` to the `IncidentsSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `includesAmount` to the `IncidentsSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `includesIdentification` to the `IncidentsSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `includesQuantity` to the `IncidentsSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `includesTime` to the `IncidentsSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestDate` to the `IncidentsSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestedByStaff` to the `IncidentsSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whoCanApply` to the `IncidentsSettings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WhoCanApply" AS ENUM ('TODOS', 'AREAS', 'OFICINAS');

-- CreateEnum
CREATE TYPE "RequestDates" AS ENUM ('UNA_FECHA', 'RANGO_FECHAS');

-- CreateEnum
CREATE TYPE "RequestDatesDetails" AS ENUM ('NINGUNA', 'PASADAS', 'FUTURAS', 'AMBAS');

-- AlterTable
ALTER TABLE "IncidentsSettings" ADD COLUMN     "areasIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "datesWillBe" "RequestDatesDetails" NOT NULL,
ADD COLUMN     "fileRequired" BOOLEAN NOT NULL,
ADD COLUMN     "fileUp" BOOLEAN NOT NULL,
ADD COLUMN     "includesAmount" BOOLEAN NOT NULL,
ADD COLUMN     "includesIdentification" BOOLEAN NOT NULL,
ADD COLUMN     "includesQuantity" BOOLEAN NOT NULL,
ADD COLUMN     "includesTime" BOOLEAN NOT NULL,
ADD COLUMN     "officeIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "requestDate" "RequestDates" NOT NULL,
ADD COLUMN     "requestedByStaff" BOOLEAN NOT NULL,
ADD COLUMN     "whoCanApply" "WhoCanApply" NOT NULL;
