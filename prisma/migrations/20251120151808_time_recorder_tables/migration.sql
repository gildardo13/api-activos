-- CreateEnum
CREATE TYPE "TimeRecorderStaffReferenceStatus" AS ENUM ('NEW', 'NO_BIOMETRIC_DATA', 'NEEDS_SYNC', 'SYNC_ERROR', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BiometricType" AS ENUM ('FINGERPRINT', 'FACE', 'CARD');

-- CreateEnum
CREATE TYPE "BiometricStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "TimeRecorderStaffReference" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "integration" TEXT NOT NULL,
    "metadata" JSONB,
    "status" "TimeRecorderStaffReferenceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeRecorderStaffReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiometricData" (
    "id" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "status" "BiometricStatus" NOT NULL,
    "type" "BiometricType" NOT NULL,
    "description" TEXT,
    "TimeRecorderStaffReferenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiometricData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceLogs" (
    "id" TEXT NOT NULL,
    "staffId" TEXT,
    "integration" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceLogs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TimeRecorderStaffReference" ADD CONSTRAINT "TimeRecorderStaffReference_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiometricData" ADD CONSTRAINT "BiometricData_TimeRecorderStaffReferenceId_fkey" FOREIGN KEY ("TimeRecorderStaffReferenceId") REFERENCES "TimeRecorderStaffReference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLogs" ADD CONSTRAINT "AttendanceLogs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
