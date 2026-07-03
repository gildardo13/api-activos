/*
  Warnings:

  - Added the required column `type` to the `AttendanceLogs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('IN', 'OUT', 'UNKNOWN');

-- AlterTable
ALTER TABLE "AttendanceLogs" ADD COLUMN     "type" "AttendanceType" NOT NULL;
