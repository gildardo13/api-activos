-- CreateEnum
CREATE TYPE "PositionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "status" "PositionStatus" NOT NULL DEFAULT 'PENDING';
