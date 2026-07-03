/*
  Warnings:

  - You are about to drop the column `cfdi_use` on the `TaxData` table. All the data in the column will be lost.
  - You are about to drop the column `legal_representative` on the `TaxData` table. All the data in the column will be lost.
  - You are about to drop the column `payer_id` on the `TaxData` table. All the data in the column will be lost.
  - You are about to drop the column `tax_address_city` on the `TaxData` table. All the data in the column will be lost.
  - You are about to drop the column `tax_address_country` on the `TaxData` table. All the data in the column will be lost.
  - You are about to drop the column `tax_address_district` on the `TaxData` table. All the data in the column will be lost.
  - You are about to drop the column `tax_address_number` on the `TaxData` table. All the data in the column will be lost.
  - You are about to drop the column `tax_address_postal_code` on the `TaxData` table. All the data in the column will be lost.
  - You are about to drop the column `tax_address_state` on the `TaxData` table. All the data in the column will be lost.
  - You are about to drop the column `tax_address_street` on the `TaxData` table. All the data in the column will be lost.
  - You are about to drop the column `tax_notes` on the `TaxData` table. All the data in the column will be lost.
  - You are about to drop the column `tax_regime` on the `TaxData` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[payerId]` on the table `TaxData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `payerId` to the `TaxData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAddressCity` to the `TaxData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAddressCountry` to the `TaxData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAddressDistrict` to the `TaxData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAddressNumber` to the `TaxData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAddressPostalCode` to the `TaxData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAddressState` to the `TaxData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAddressStreet` to the `TaxData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxRegime` to the `TaxData` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TaxData" DROP CONSTRAINT "TaxData_payer_id_fkey";

-- DropIndex
DROP INDEX "TaxData_payer_id_key";

-- AlterTable
ALTER TABLE "TaxData" DROP COLUMN "cfdi_use",
DROP COLUMN "legal_representative",
DROP COLUMN "payer_id",
DROP COLUMN "tax_address_city",
DROP COLUMN "tax_address_country",
DROP COLUMN "tax_address_district",
DROP COLUMN "tax_address_number",
DROP COLUMN "tax_address_postal_code",
DROP COLUMN "tax_address_state",
DROP COLUMN "tax_address_street",
DROP COLUMN "tax_notes",
DROP COLUMN "tax_regime",
ADD COLUMN     "cfdiUse" TEXT,
ADD COLUMN     "legalRepresentative" TEXT,
ADD COLUMN     "payerId" TEXT NOT NULL,
ADD COLUMN     "taxAddressCity" TEXT NOT NULL,
ADD COLUMN     "taxAddressCountry" TEXT NOT NULL,
ADD COLUMN     "taxAddressDistrict" TEXT NOT NULL,
ADD COLUMN     "taxAddressNumber" TEXT NOT NULL,
ADD COLUMN     "taxAddressPostalCode" TEXT NOT NULL,
ADD COLUMN     "taxAddressState" TEXT NOT NULL,
ADD COLUMN     "taxAddressStreet" TEXT NOT NULL,
ADD COLUMN     "taxNotes" TEXT,
ADD COLUMN     "taxRegime" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TaxData_payerId_key" ON "TaxData"("payerId");

-- AddForeignKey
ALTER TABLE "TaxData" ADD CONSTRAINT "TaxData_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "Payer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
