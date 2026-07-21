-- CreateTable
CREATE TABLE "catalogs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_items" (
    "id" TEXT NOT NULL,
    "catalog_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalogs_key_key" ON "catalogs"("key");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_items_catalog_id_key_key" ON "catalog_items"("catalog_id", "key");

-- AddForeignKey
ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
