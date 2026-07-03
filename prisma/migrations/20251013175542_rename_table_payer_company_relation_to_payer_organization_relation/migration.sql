/*
  Warnings:

  - You are about to drop the `PayerCompanyRelation` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PayerOrganizationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "PayerCompanyRelation" DROP CONSTRAINT "PayerCompanyRelation_payerId_fkey";

-- DropTable
DROP TABLE "PayerCompanyRelation";

-- DropEnum
DROP TYPE "PayerCompanyStatus";

-- CreateTable
CREATE TABLE "payerOrganizationRelation" (
    "id" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "status" "PayerOrganizationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payerOrganizationRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payerOrganizationRelation_payerId_organizationId_key" ON "payerOrganizationRelation"("payerId", "organizationId");

-- AddForeignKey
ALTER TABLE "payerOrganizationRelation" ADD CONSTRAINT "payerOrganizationRelation_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "Payer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
