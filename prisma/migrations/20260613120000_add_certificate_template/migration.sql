-- AlterTable: Add the selected default certificate template id
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "certificateTemplate" TEXT NOT NULL DEFAULT 'classic';
