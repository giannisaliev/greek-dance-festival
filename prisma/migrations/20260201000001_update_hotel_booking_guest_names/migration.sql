-- AlterTable: Update HotelBooking to use guestNames array instead of firstName/lastName and remove guests count
ALTER TABLE "HotelBooking" ADD COLUMN "guestNames" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate existing data: combine firstName and lastName into guestNames array
UPDATE "HotelBooking" SET "guestNames" = ARRAY["firstName" || ' ' || "lastName"];

-- Drop old columns
ALTER TABLE "HotelBooking" DROP COLUMN "firstName";
ALTER TABLE "HotelBooking" DROP COLUMN "lastName";
ALTER TABLE "HotelBooking" DROP COLUMN "guests";
