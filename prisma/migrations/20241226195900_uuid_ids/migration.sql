/*
  Warnings:

  - The primary key for the `Area` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Level` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Office` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Subarea` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_areaId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_levelId_fkey";

-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_officeId_fkey";

-- DropForeignKey
ALTER TABLE "Subarea" DROP CONSTRAINT "Subarea_areaId_fkey";

-- DropForeignKey
ALTER TABLE "Subarea" DROP CONSTRAINT "Subarea_parentSubareaId_fkey";

-- AlterTable
ALTER TABLE "Area" DROP CONSTRAINT "Area_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Area_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Area_id_seq";

-- AlterTable
ALTER TABLE "Level" DROP CONSTRAINT "Level_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Level_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Level_id_seq";

-- AlterTable
ALTER TABLE "Office" DROP CONSTRAINT "Office_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Office_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Office_id_seq";

-- AlterTable
ALTER TABLE "Position" ALTER COLUMN "levelId" SET DATA TYPE TEXT,
ALTER COLUMN "areaId" SET DATA TYPE TEXT,
ALTER COLUMN "officeId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Subarea" DROP CONSTRAINT "Subarea_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "areaId" SET DATA TYPE TEXT,
ALTER COLUMN "parentSubareaId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Subarea_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Subarea_id_seq";

-- AddForeignKey
ALTER TABLE "Subarea" ADD CONSTRAINT "Subarea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subarea" ADD CONSTRAINT "Subarea_parentSubareaId_fkey" FOREIGN KEY ("parentSubareaId") REFERENCES "Subarea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
