import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fallback migration endpoint that creates the ClassCheckIn table if it does not exist.
// Normally `prisma migrate deploy` (run during vercel-build) handles this, but this route
// lets us apply the change on demand in production, matching the other migrate-* routes.
export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        { error: "This endpoint is only available in production" },
        { status: 403 }
      );
    }

    await prisma.$executeRawUnsafe(`
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
    `);

    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "ClassCheckIn_scheduleId_idx" ON "ClassCheckIn"("scheduleId");`
    );
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "ClassCheckIn_participantId_idx" ON "ClassCheckIn"("participantId");`
    );
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "ClassCheckIn_scheduleId_participantId_key" ON "ClassCheckIn"("scheduleId", "participantId");`
    );

    return NextResponse.json({
      message: "Migration completed successfully",
      table: "ClassCheckIn",
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
