-- AlterTable: Add Google Maps URL column for the Greek Night event location
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "greekNightMapUrl" TEXT;
