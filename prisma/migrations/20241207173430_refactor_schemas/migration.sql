-- AlterTable
ALTER TABLE "DocumentApprovals" ALTER COLUMN "estatus" SET DEFAULT 'En espera',
ALTER COLUMN "ip" DROP NOT NULL,
ALTER COLUMN "device" DROP NOT NULL,
ALTER COLUMN "cancellationReason" DROP NOT NULL;
