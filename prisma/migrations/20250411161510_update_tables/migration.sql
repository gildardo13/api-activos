-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_officeId_fkey";

-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_positionId_fkey";

-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_vacationPolicieId_fkey";

-- AlterTable
ALTER TABLE "Staff" ALTER COLUMN "dateOfBirth" DROP NOT NULL,
ALTER COLUMN "positionId" DROP NOT NULL,
ALTER COLUMN "officeId" DROP NOT NULL,
ALTER COLUMN "vacationPolicieId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_vacationPolicieId_fkey" FOREIGN KEY ("vacationPolicieId") REFERENCES "VacationPolicies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
