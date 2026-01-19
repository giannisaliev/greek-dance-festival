import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Add isTeacher and studioName columns to User table
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "isTeacher" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "studioName" TEXT;
    `;

    return NextResponse.json({ 
      message: "Migration completed successfully",
      changes: [
        "Added isTeacher column to User table",
        "Added studioName column to User table"
      ]
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: error },
      { status: 500 }
    );
  }
}
