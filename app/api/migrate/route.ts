import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// POST - Run migration (Admin only, one-time use)
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if columns exist by trying to update
    try {
      await prisma.settings.updateMany({
        data: {
          showTbaTeachers: false,
          tbaTeachersCount: 3,
        },
      });
      
      return NextResponse.json({ 
        success: true, 
        message: "Migration successful - columns already exist or were added" 
      });
    } catch (error: any) {
      // If columns don't exist, use raw SQL to add them
      if (error.message?.includes('column')) {
        await prisma.$executeRaw`
          ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "showTbaTeachers" BOOLEAN DEFAULT false;
        `;
        await prisma.$executeRaw`
          ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "tbaTeachersCount" INTEGER DEFAULT 3;
        `;
        
        // Update existing records
        await prisma.$executeRaw`
          UPDATE "Settings" SET "showTbaTeachers" = false, "tbaTeachersCount" = 3 WHERE "showTbaTeachers" IS NULL;
        `;
        
        return NextResponse.json({ 
          success: true, 
          message: "Migration completed successfully - columns added" 
        });
      }
      
      throw error;
    }
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed", details: error.message },
      { status: 500 }
    );
  }
}
