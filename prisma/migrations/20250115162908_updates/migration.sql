/*
  Warnings:

  - Added the required column `customArea` to the `Subarea` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subarea" ADD COLUMN     "customArea" BOOLEAN NOT NULL;
