-- CreateTable: per-class attendance check-in (registered participants + walk-ins)
CREATE TABLE IF NOT EXISTS "ClassCheckIn" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "participantId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ClassCheckIn_scheduleId_idx" ON "ClassCheckIn"("scheduleId");
CREATE INDEX IF NOT EXISTS "ClassCheckIn_participantId_idx" ON "ClassCheckIn"("participantId");

-- A registered participant can only be checked in once per class. Walk-ins have a null
-- participantId; Postgres treats nulls as distinct, so multiple walk-ins per class are allowed.
CREATE UNIQUE INDEX IF NOT EXISTS "ClassCheckIn_scheduleId_participantId_key" ON "ClassCheckIn"("scheduleId", "participantId");
