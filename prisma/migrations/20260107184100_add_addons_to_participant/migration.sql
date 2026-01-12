/*
  Warnings:

  - Added the required column `totalPrice` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "packageType" TEXT NOT NULL,
    "guinnessRecordAttempt" BOOLEAN NOT NULL DEFAULT false,
    "greekNight" BOOLEAN NOT NULL DEFAULT false,
    "totalPrice" INTEGER NOT NULL,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Participant" ("checkedIn", "createdAt", "id", "packageType", "phone", "updatedAt", "userId") SELECT "checkedIn", "createdAt", "id", "packageType", "phone", "updatedAt", "userId" FROM "Participant";
DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";
CREATE UNIQUE INDEX "Participant_userId_key" ON "Participant"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
