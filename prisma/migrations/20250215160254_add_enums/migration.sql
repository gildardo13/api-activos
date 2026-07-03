/*
  Warnings:

  - Changed the type of `typeContract` on the `StaffNomina` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `contractDuration` on the `StaffNomina` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('INDETERMINADO', 'TEMPORAL', 'OBRAPROYECTO', 'HONORARIOSINDEPENDIENTES', 'PRACTICASPROFESIONALES', 'APRENDIZAJE');

-- CreateEnum
CREATE TYPE "ContractDuration" AS ENUM ('MENSUAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'INDEFINIDO');

-- AlterTable
ALTER TABLE "StaffNomina" DROP COLUMN "typeContract",
ADD COLUMN     "typeContract" "ContractType" NOT NULL,
DROP COLUMN "contractDuration",
ADD COLUMN     "contractDuration" "ContractDuration" NOT NULL;
