-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_reportsToStaff_fkey" FOREIGN KEY ("reportsToStaff") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
