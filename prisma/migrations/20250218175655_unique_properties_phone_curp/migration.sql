/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `StaffDataPrivate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[curp]` on the table `StaffDataPrivate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StaffDataPrivate_phone_key" ON "StaffDataPrivate"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "StaffDataPrivate_curp_key" ON "StaffDataPrivate"("curp");
