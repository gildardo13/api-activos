-- CreateTable
CREATE TABLE "NominaConcept" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "recoverable" BOOLEAN NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "NominaConcept_pkey" PRIMARY KEY ("id")
);
