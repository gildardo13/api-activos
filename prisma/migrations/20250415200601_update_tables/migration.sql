-- CreateTable
CREATE TABLE "FieldRequirement" (
    "id" SERIAL NOT NULL,
    "fieldName" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FieldRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FieldRequirement_fieldName_key" ON "FieldRequirement"("fieldName");
