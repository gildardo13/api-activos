-- CreateTable
CREATE TABLE "EmploymentDetails" (
    "id" TEXT NOT NULL,
    "workSchedule" TEXT NOT NULL,
    "paymentFrequency" TEXT NOT NULL,
    "monthlySalary" DOUBLE PRECISION NOT NULL,
    "dailyBaseSalary" DOUBLE PRECISION NOT NULL,
    "dailyIntegratedSalary" DOUBLE PRECISION NOT NULL,
    "salaryModificationDate" TIMESTAMP(3) NOT NULL,
    "employmentStartDate" TIMESTAMP(3) NOT NULL,
    "seniorityRecognitionDate" TIMESTAMP(3) NOT NULL,
    "contractExpirationDate" TIMESTAMP(3) NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "EmploymentDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmploymentDetails_staffId_key" ON "EmploymentDetails"("staffId");

-- AddForeignKey
ALTER TABLE "EmploymentDetails" ADD CONSTRAINT "EmploymentDetails_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
