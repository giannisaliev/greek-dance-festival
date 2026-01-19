import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check if running in production
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { error: "This endpoint is only available in production" },
        { status: 403 }
      );
    }

    // Execute raw SQL to add the new columns if they don't exist
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='Participant' AND column_name='registrantFirstName') 
        THEN
          ALTER TABLE "Participant" ADD COLUMN "registrantFirstName" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='Participant' AND column_name='registrantLastName') 
        THEN
          ALTER TABLE "Participant" ADD COLUMN "registrantLastName" TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='Participant' AND column_name='registeredBy') 
        THEN
          ALTER TABLE "Participant" ADD COLUMN "registeredBy" TEXT;
        END IF;
      END $$;
    `);

    return NextResponse.json({
      message: "Migration completed successfully",
      columns: [
        "registrantFirstName",
        "registrantLastName", 
        "registeredBy"
      ]
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { 
        error: "Migration failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
