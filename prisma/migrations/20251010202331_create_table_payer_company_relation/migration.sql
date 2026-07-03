-- CreateEnum
CREATE TYPE "PayerCompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "PayerCompanyRelation" (
    "id" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "enterpriseId" TEXT NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "status" "PayerCompanyStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayerCompanyRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayerCompanyRelation_payerId_enterpriseId_key" ON "PayerCompanyRelation"("payerId", "enterpriseId");

-- AddForeignKey
ALTER TABLE "PayerCompanyRelation" ADD CONSTRAINT "PayerCompanyRelation_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "Payer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
