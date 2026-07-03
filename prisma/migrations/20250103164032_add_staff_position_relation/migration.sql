-- CreateTable
CREATE TABLE "Staff" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "firstSurname" TEXT NOT NULL,
    "secondSurname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "curp" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
