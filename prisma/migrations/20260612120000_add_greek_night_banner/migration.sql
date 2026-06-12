-- AlterTable: Add show/hide toggle for the Greek Night homepage banner box
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "greekNightBannerEnabled" BOOLEAN NOT NULL DEFAULT true;
