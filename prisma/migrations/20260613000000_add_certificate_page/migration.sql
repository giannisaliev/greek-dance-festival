-- AlterTable: Add show/hide toggle for the Guinness Record certificate page
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "certificatePageEnabled" BOOLEAN NOT NULL DEFAULT false;
