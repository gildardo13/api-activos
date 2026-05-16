-- AlterTable
ALTER TABLE "EmployeeTermination" ADD COLUMN     "terminatedBy" TEXT;

-- AddForeignKey
ALTER TABLE "EmployeeTermination" ADD CONSTRAINT "EmployeeTermination_terminatedBy_fkey" FOREIGN KEY ("terminatedBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
