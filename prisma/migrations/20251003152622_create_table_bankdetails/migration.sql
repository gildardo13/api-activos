-- CreateEnum
CREATE TYPE "BankAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('SPEI', 'SWIFT', 'ACH', 'SEPA', 'CHECK', 'OTHER');

-- CreateTable
CREATE TABLE "BankDetails" (
    "id" TEXT NOT NULL,
    "payerId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "clabe" TEXT,
    "swift" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "status" "BankAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BankDetails" ADD CONSTRAINT "BankDetails_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "Payer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
