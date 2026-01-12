-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'settings',
    "registrationOpen" BOOLEAN NOT NULL DEFAULT false,
    "registrationMessage" TEXT NOT NULL DEFAULT 'Registration opens on March 1st, 2026',
    "updatedAt" DATETIME NOT NULL
);
