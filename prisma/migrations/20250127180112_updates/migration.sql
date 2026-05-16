-- CreateTable
CREATE TABLE "StaffFiles" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "validity" TIMESTAMP(3),

    CONSTRAINT "StaffFiles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StaffFiles" ADD CONSTRAINT "StaffFiles_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
