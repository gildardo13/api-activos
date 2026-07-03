-- CreateTable
CREATE TABLE "TaxData" (
    "id" TEXT NOT NULL,
    "payer_id" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "curp" TEXT,
    "tax_regime" TEXT NOT NULL,
    "tax_address_street" TEXT NOT NULL,
    "tax_address_number" TEXT NOT NULL,
    "tax_address_district" TEXT NOT NULL,
    "tax_address_city" TEXT NOT NULL,
    "tax_address_state" TEXT NOT NULL,
    "tax_address_postal_code" TEXT NOT NULL,
    "tax_address_country" TEXT NOT NULL,
    "legal_representative" TEXT,
    "cfdi_use" TEXT,
    "tax_notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxData_payer_id_key" ON "TaxData"("payer_id");

-- AddForeignKey
ALTER TABLE "TaxData" ADD CONSTRAINT "TaxData_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "Payer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
