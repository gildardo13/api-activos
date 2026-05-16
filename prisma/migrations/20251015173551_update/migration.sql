-- AlterTable
ALTER TABLE "StaffNomina" ADD COLUMN     "baseContributionSalary" DECIMAL(18,2) DEFAULT 0,
ADD COLUMN     "dailyNetSalary" DECIMAL(18,2) DEFAULT 0,
ADD COLUMN     "payerComplementaryId" TEXT,
ADD COLUMN     "payerFiscalId" TEXT;

-- AddForeignKey
ALTER TABLE "StaffNomina" ADD CONSTRAINT "StaffNomina_payerFiscalId_fkey" FOREIGN KEY ("payerFiscalId") REFERENCES "Payer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffNomina" ADD CONSTRAINT "StaffNomina_payerComplementaryId_fkey" FOREIGN KEY ("payerComplementaryId") REFERENCES "Payer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
