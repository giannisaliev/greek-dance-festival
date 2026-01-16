-- AlterTable
ALTER TABLE "Settings" ADD COLUMN "showTbaTeachers" BOOLEAN DEFAULT false;
ALTER TABLE "Settings" ADD COLUMN "tbaTeachersCount" INTEGER DEFAULT 3;

-- Update existing settings record if it exists
UPDATE "Settings" SET "showTbaTeachers" = false, "tbaTeachersCount" = 3 WHERE "id" = 'settings';
