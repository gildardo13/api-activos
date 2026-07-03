/*
  Warnings:

  - The values [OBRAPROYECTO,HONORARIOSINDEPENDIENTES,PRACTICASPROFESIONALES] on the enum `ContractType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContractType_new" AS ENUM ('INDETERMINADO', 'TEMPORAL', 'OBRA_PROYECTO', 'HONORARIOS_INDEPENDIENTES', 'PRACTICAS_PROFESIONALES', 'APRENDIZAJE');
ALTER TABLE "StaffNomina" ALTER COLUMN "typeContract" TYPE "ContractType_new" USING ("typeContract"::text::"ContractType_new");
ALTER TYPE "ContractType" RENAME TO "ContractType_old";
ALTER TYPE "ContractType_new" RENAME TO "ContractType";
DROP TYPE "ContractType_old";
COMMIT;
