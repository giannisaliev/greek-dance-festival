-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN "roomOrder" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate existing data: populate roomOrder with alphabetically sorted keys from prices
-- This will be the initial order, admin can reorder by editing hotels
UPDATE "Hotel"
SET "roomOrder" = ARRAY(SELECT jsonb_object_keys(prices::jsonb) ORDER BY jsonb_object_keys(prices::jsonb));
