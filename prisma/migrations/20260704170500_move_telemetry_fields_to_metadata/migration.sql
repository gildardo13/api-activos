-- Ensure columns exist before migrating (required for shadow database validation)
ALTER TABLE "AssetTelemetryLog" ADD COLUMN IF NOT EXISTS "din1" INTEGER;
ALTER TABLE "AssetTelemetryLog" ADD COLUMN IF NOT EXISTS "din2" INTEGER;
ALTER TABLE "AssetTelemetryLog" ADD COLUMN IF NOT EXISTS "dout1" INTEGER;
ALTER TABLE "AssetTelemetryLog" ADD COLUMN IF NOT EXISTS "ain1" INTEGER;
ALTER TABLE "AssetTelemetryLog" ADD COLUMN IF NOT EXISTS "ignition" INTEGER;
ALTER TABLE "AssetTelemetryLog" ADD COLUMN IF NOT EXISTS "externalVoltage" DOUBLE PRECISION;
ALTER TABLE "AssetTelemetryLog" ADD COLUMN IF NOT EXISTS "batteryVoltage" DOUBLE PRECISION;

-- Add new JSONB metadata column
ALTER TABLE "AssetTelemetryLog" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- Migrate data from flat columns to JSONB metadata object (removing null keys)
UPDATE "AssetTelemetryLog"
SET "metadata" = jsonb_strip_nulls(
  jsonb_build_object(
    'din1', "din1",
    'din2', "din2",
    'dout1', "dout1",
    'ain1', "ain1",
    'ignition', "ignition",
    'externalVoltage', "externalVoltage",
    'batteryVoltage', "batteryVoltage"
  )
)
WHERE "metadata" IS NULL;

-- Drop original flat columns
ALTER TABLE "AssetTelemetryLog" 
DROP COLUMN IF EXISTS "din1",
DROP COLUMN IF EXISTS "din2",
DROP COLUMN IF EXISTS "dout1",
DROP COLUMN IF EXISTS "ain1",
DROP COLUMN IF EXISTS "ignition",
DROP COLUMN IF EXISTS "externalVoltage",
DROP COLUMN IF EXISTS "batteryVoltage";
