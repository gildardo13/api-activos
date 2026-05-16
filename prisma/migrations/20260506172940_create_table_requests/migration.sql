-- CreateEnum
CREATE TYPE "RequestTypeDateType" AS ENUM ('single', 'multiple');

-- CreateEnum
CREATE TYPE "RequestTypeDatePeriod" AS ENUM ('past', 'future', 'both');

-- CreateTable
CREATE TABLE "request_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "can_request" BOOLEAN NOT NULL DEFAULT false,
    "date_type" "RequestTypeDateType" NOT NULL DEFAULT 'single',
    "date_period" "RequestTypeDatePeriod" NOT NULL DEFAULT 'both',
    "has_time" BOOLEAN NOT NULL DEFAULT false,
    "has_amount" BOOLEAN NOT NULL DEFAULT false,
    "has_quantity" BOOLEAN NOT NULL DEFAULT false,
    "accept_file" BOOLEAN NOT NULL DEFAULT false,
    "requires_file" BOOLEAN NOT NULL DEFAULT false,
    "file_instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_type_assignments" (
    "id" TEXT NOT NULL,
    "request_type_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "subarea_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_type_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "type" TEXT NOT NULL,
    "request_type_assignment_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "dates" TIMESTAMP(3)[],
    "start_time" TEXT,
    "end_time" TEXT,
    "amount" DOUBLE PRECISION,
    "quantity" INTEGER,
    "file_url" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "request_type_assignments" ADD CONSTRAINT "request_type_assignments_request_type_id_fkey" FOREIGN KEY ("request_type_id") REFERENCES "request_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_type_assignments" ADD CONSTRAINT "request_type_assignments_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_type_assignments" ADD CONSTRAINT "request_type_assignments_subarea_id_fkey" FOREIGN KEY ("subarea_id") REFERENCES "Subarea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_request_type_assignment_id_fkey" FOREIGN KEY ("request_type_assignment_id") REFERENCES "request_type_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
