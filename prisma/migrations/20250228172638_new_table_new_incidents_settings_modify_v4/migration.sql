/*
  Warnings:

  - The values [UNA_FECHA,RANGO_FECHAS] on the enum `RequestDates` will be removed. If these variants are still used in the database, this will fail.
  - The values [NINGUNA,PASADAS,FUTURAS,AMBAS] on the enum `RequestDatesDetails` will be removed. If these variants are still used in the database, this will fail.
  - The values [TODOS,AREAS,OFICINAS] on the enum `WhoCanApply` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestDates_new" AS ENUM ('single', 'range');
ALTER TABLE "IncidentsSettings" ALTER COLUMN "requestDate" TYPE "RequestDates_new" USING ("requestDate"::text::"RequestDates_new");
ALTER TYPE "RequestDates" RENAME TO "RequestDates_old";
ALTER TYPE "RequestDates_new" RENAME TO "RequestDates";
DROP TYPE "RequestDates_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RequestDatesDetails_new" AS ENUM ('past', 'future', 'both');
ALTER TABLE "IncidentsSettings" ALTER COLUMN "datesWillBe" TYPE "RequestDatesDetails_new" USING ("datesWillBe"::text::"RequestDatesDetails_new");
ALTER TYPE "RequestDatesDetails" RENAME TO "RequestDatesDetails_old";
ALTER TYPE "RequestDatesDetails_new" RENAME TO "RequestDatesDetails";
DROP TYPE "RequestDatesDetails_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "WhoCanApply_new" AS ENUM ('all', 'areas', 'offices');
ALTER TABLE "IncidentsSettings" ALTER COLUMN "whoCanApply" TYPE "WhoCanApply_new" USING ("whoCanApply"::text::"WhoCanApply_new");
ALTER TYPE "WhoCanApply" RENAME TO "WhoCanApply_old";
ALTER TYPE "WhoCanApply_new" RENAME TO "WhoCanApply";
DROP TYPE "WhoCanApply_old";
COMMIT;
