-- DropForeignKey
ALTER TABLE "request_type_assignments" DROP CONSTRAINT "request_type_assignments_area_id_fkey";

-- AlterTable
ALTER TABLE "request_type_assignments" ALTER COLUMN "area_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "request_type_assignments" ADD CONSTRAINT "request_type_assignments_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;
