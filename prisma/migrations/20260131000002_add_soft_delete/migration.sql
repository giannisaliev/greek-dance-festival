-- AlterTable
ALTER TABLE "Participant" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Participant" ADD COLUMN "deletedBy" TEXT;
