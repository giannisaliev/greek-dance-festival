-- CreateTable
CREATE TABLE IF NOT EXISTS "Analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "pagePath" TEXT NOT NULL,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Analytics_userId_idx" ON "Analytics"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Analytics_sessionId_idx" ON "Analytics"("sessionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Analytics_eventType_idx" ON "Analytics"("eventType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Analytics_createdAt_idx" ON "Analytics"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Analytics_isAdmin_idx" ON "Analytics"("isAdmin");
