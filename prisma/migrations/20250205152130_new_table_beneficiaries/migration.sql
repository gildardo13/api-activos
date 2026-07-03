-- CreateTable
CREATE TABLE "StaffBeneficiaries" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "kinship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "percent" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "StaffBeneficiaries_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StaffBeneficiaries" ADD CONSTRAINT "StaffBeneficiaries_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
