-- CreateTable
CREATE TABLE "EmployeeTermination" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "terminationDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "descrition" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeTermination_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmployeeTermination" ADD CONSTRAINT "EmployeeTermination_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
