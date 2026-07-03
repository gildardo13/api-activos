-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "gpsDeviceId" TEXT;

-- AlterTable
ALTER TABLE "AssetTelemetryLog" ADD COLUMN     "imei" TEXT;

-- CreateTable
CREATE TABLE "GpsDevice" (
    "id" TEXT NOT NULL,
    "imei" TEXT NOT NULL,
    "model" TEXT,
    "phoneNumber" TEXT,
    "providerCompany" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GpsDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GpsDevice_imei_key" ON "GpsDevice"("imei");

-- CreateIndex
CREATE INDEX "GpsDevice_imei_idx" ON "GpsDevice"("imei");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_gpsDeviceId_fkey" FOREIGN KEY ("gpsDeviceId") REFERENCES "GpsDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
