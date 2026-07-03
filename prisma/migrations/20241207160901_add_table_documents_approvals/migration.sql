/*
  Warnings:

  - The primary key for the `Position` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_reportsToId_fkey";

-- AlterTable
ALTER TABLE "Position" DROP CONSTRAINT "Position_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "reportsToId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Position_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Position_id_seq";

-- CreateTable
CREATE TABLE "DocumentApprovals" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "aut" BOOLEAN NOT NULL DEFAULT false,
    "module" TEXT NOT NULL,
    "estatus" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "cancellationReason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "positionId" TEXT NOT NULL,

    CONSTRAINT "DocumentApprovals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_reportsToId_fkey" FOREIGN KEY ("reportsToId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentApprovals" ADD CONSTRAINT "DocumentApprovals_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
