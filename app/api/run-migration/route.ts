import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// POST - Run migration to add order column (Admin only, one-time use)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Check if order column already exists
    const teacher = await prisma.teacher.findFirst();
    if (teacher && 'order' in teacher) {
      return NextResponse.json({
        success: true,
        message: "Order column already exists",
        alreadyExists: true,
      });
    }

    // Run the migration SQL directly
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Teacher" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;
    `);

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully. Order column added to Teacher table.",
    });
  } catch (error: any) {
    console.error("Error running migration:", error);
    
    // If error is about column already existing, that's fine
    if (error.message?.includes("already exists")) {
      return NextResponse.json({
        success: true,
        message: "Order column already exists",
        alreadyExists: true,
      });
    }

    return NextResponse.json(
      { 
        error: "Failed to run migration",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
