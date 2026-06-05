-- AlterTable: Add name and image URL columns for hall locations
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "fridayHall1Name" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "fridayHall2Name" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "saturdayHall1Name" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "saturdayHall2Name" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "fridayHall1Image" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "fridayHall2Image" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "saturdayHall1Image" TEXT;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "saturdayHall2Image" TEXT;
