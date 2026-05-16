/*
  Warnings:

  - Added the required column `payerType` to the `Payer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PayerType" AS ENUM ('INDIVIDUAL', 'LEGAL_ENTITY');

-- AlterTable
ALTER TABLE "Payer" ADD COLUMN     "payerType" "PayerType" NOT NULL;
