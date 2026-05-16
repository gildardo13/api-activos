/*
  Warnings:

  - You are about to drop the column `contractExpirationDate` on the `EmploymentDetails` table. All the data in the column will be lost.
  - You are about to drop the column `dailyBaseSalary` on the `EmploymentDetails` table. All the data in the column will be lost.
  - You are about to drop the column `dailyIntegratedSalary` on the `EmploymentDetails` table. All the data in the column will be lost.
  - You are about to drop the column `employmentStartDate` on the `EmploymentDetails` table. All the data in the column will be lost.
  - You are about to drop the column `monthlySalary` on the `EmploymentDetails` table. All the data in the column will be lost.
  - You are about to drop the column `paymentFrequency` on the `EmploymentDetails` table. All the data in the column will be lost.
  - You are about to drop the column `salaryModificationDate` on the `EmploymentDetails` table. All the data in the column will be lost.
  - You are about to drop the column `seniorityRecognitionDate` on the `EmploymentDetails` table. All the data in the column will be lost.
  - You are about to drop the column `workSchedule` on the `EmploymentDetails` table. All the data in the column will be lost.
  - Added the required column `employmentStartDate` to the `Staff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmploymentDetails" DROP COLUMN "contractExpirationDate",
DROP COLUMN "dailyBaseSalary",
DROP COLUMN "dailyIntegratedSalary",
DROP COLUMN "employmentStartDate",
DROP COLUMN "monthlySalary",
DROP COLUMN "paymentFrequency",
DROP COLUMN "salaryModificationDate",
DROP COLUMN "seniorityRecognitionDate",
DROP COLUMN "workSchedule";

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "detailsId" TEXT,
ADD COLUMN     "employmentStartDate" TIMESTAMP(3) NOT NULL;
