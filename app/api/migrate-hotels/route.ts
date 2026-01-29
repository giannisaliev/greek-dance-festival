import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { PrismaClient } from "@prisma/client";

// POST - Run migration to add breakfast and city tax columns (Admin only, one-time use)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await new PrismaClient().user.findUnique({
      where: { email: session.user.email! },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Create a direct connection using DIRECT_URL for migration
    const directPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
      },
    });

    try {
      // Run the migration SQL directly (IF NOT EXISTS handles if columns already exist)
      await directPrisma.$executeRawUnsafe(`
        ALTER TABLE "Hotel" ADD COLUMN IF NOT EXISTS "breakfastIncluded" BOOLEAN DEFAULT false;
      `);
      
      await directPrisma.$executeRawUnsafe(`
        ALTER TABLE "Hotel" ADD COLUMN IF NOT EXISTS "cityTax" DOUBLE PRECISION;
      `);
      
      // Update existing records to set breakfastIncluded to false if NULL
      await directPrisma.$executeRawUnsafe(`
        UPDATE "Hotel" SET "breakfastIncluded" = false WHERE "breakfastIncluded" IS NULL;
      `);
    } finally {
      await directPrisma.$disconnect();
    }

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully. Hotel breakfast and city tax columns added.",
    });
  } catch (error: any) {
    console.error("Error running migration:", error);
    
    // If error is about column already existing, that's fine
    if (error.message?.includes("already exists")) {
      return NextResponse.json({
        success: true,
        message: "Columns already exist",
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
