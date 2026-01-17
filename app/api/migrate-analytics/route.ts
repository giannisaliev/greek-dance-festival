import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Migration endpoint for creating Analytics table in production
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Run migration using raw SQL
    await prisma.$executeRaw`
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
      )
    `;

    // Create indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Analytics_userId_idx" ON "Analytics"("userId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Analytics_sessionId_idx" ON "Analytics"("sessionId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Analytics_eventType_idx" ON "Analytics"("eventType")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Analytics_createdAt_idx" ON "Analytics"("createdAt")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Analytics_isAdmin_idx" ON "Analytics"("isAdmin")`;

    return NextResponse.json({
      success: true,
      message: "Analytics table created successfully",
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
