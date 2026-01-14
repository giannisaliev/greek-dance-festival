-- AlterTable
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Set giannisaliev@gmail.com as admin
UPDATE "User" SET "isAdmin" = true WHERE "email" = 'giannisaliev@gmail.com';
