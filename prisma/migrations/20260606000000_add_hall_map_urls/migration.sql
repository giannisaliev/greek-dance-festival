-- AlterTable: Add Google Maps URL columns for hall locations
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "fridayHall1MapUrl" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "fridayHall2MapUrl" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "saturdayHall1MapUrl" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "saturdayHall2MapUrl" TEXT;
