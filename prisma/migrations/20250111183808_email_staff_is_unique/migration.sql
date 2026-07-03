/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Staff` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");
