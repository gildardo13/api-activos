/*
  Warnings:

  - Added the required column `activities` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authority` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `education` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experience` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `functions` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interactions` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `knowledge` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxAge` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minAge` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nonroutine` to the `Position` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsibilities` to the `Position` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "activities" TEXT NOT NULL,
ADD COLUMN     "authority" TEXT NOT NULL,
ADD COLUMN     "education" TEXT NOT NULL,
ADD COLUMN     "experience" TEXT NOT NULL,
ADD COLUMN     "functions" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "interactions" TEXT NOT NULL,
ADD COLUMN     "knowledge" TEXT NOT NULL,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "maxAge" INTEGER NOT NULL,
ADD COLUMN     "minAge" INTEGER NOT NULL,
ADD COLUMN     "nonroutine" TEXT NOT NULL,
ADD COLUMN     "responsibilities" TEXT NOT NULL,
ADD COLUMN     "specialization" TEXT[] DEFAULT ARRAY[]::TEXT[];
