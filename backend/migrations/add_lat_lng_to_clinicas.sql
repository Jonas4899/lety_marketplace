-- Add latitude and longitude columns to clinicas table
ALTER TABLE "clinicas"
  ADD COLUMN "latitud" DECIMAL(9,6),
  ADD COLUMN "longitud" DECIMAL(9,6);

-- Index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_clinicas_latitud ON "clinicas" ("latitud");
CREATE INDEX IF NOT EXISTS idx_clinicas_longitud ON "clinicas" ("longitud");