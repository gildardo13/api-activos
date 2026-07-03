-- AlterTable
ALTER TABLE "request_types" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "can_request" SET DEFAULT true;

-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "comments" TEXT;
