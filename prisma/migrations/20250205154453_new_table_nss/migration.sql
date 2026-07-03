/*
  Warnings:

  - Made the column `nss` on table `StaffDataPrivate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StaffDataPrivate" ALTER COLUMN "nss" SET NOT NULL;
