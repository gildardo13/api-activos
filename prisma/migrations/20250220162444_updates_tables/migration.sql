-- AlterTable
ALTER TABLE "EmployeeTermination" ADD COLUMN     "files" TEXT[],
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';
