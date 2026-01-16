import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET settings (public)
export async function GET() {
  try {
    // Use raw query to handle missing columns gracefully
    const settings: any = await prisma.$queryRaw`
      SELECT * FROM "Settings" WHERE id = 'settings' LIMIT 1
    `;

    if (!settings || settings.length === 0) {
      // Create default settings
      try {
        await prisma.$executeRaw`
          INSERT INTO "Settings" (id, "registrationOpen", "registrationMessage", "updatedAt")
          VALUES ('settings', false, 'Registration opens on March 1st, 2026', NOW())
        `;
      } catch (e) {
        // Settings might already exist, ignore error
      }

      return NextResponse.json({
        id: "settings",
        registrationOpen: false,
        registrationMessage: "Registration opens on March 1st, 2026",
        showTbaTeachers: false,
        tbaTeachersCount: 3,
      });
    }

    const setting = settings[0];
    
    return NextResponse.json({
      id: setting.id,
      registrationOpen: setting.registrationOpen || false,
      registrationMessage: setting.registrationMessage || "Registration opens on March 1st, 2026",
      showTbaTeachers: setting.showTbaTeachers ?? false,
      tbaTeachersCount: setting.tbaTeachersCount ?? 3,
      updatedAt: setting.updatedAt,
    });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    // Return default values on any error
    return NextResponse.json({
      id: "settings",
      registrationOpen: false,
      registrationMessage: "Registration opens on March 1st, 2026",
      showTbaTeachers: false,
      tbaTeachersCount: 3,
    });
  }
}

// Helper to check if TBA columns exist
async function checkTbaColumnsExist(): Promise<boolean> {
  try {
    await prisma.$queryRaw`
      SELECT "showTbaTeachers", "tbaTeachersCount" FROM "Settings" LIMIT 1
    `;
    return true;
  } catch (error) {
    return false;
  }
}

// PUT update settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationOpen, registrationMessage, showTbaTeachers, tbaTeachersCount } = body;

    // Check if TBA columns exist
    const hasNewColumns = await checkTbaColumnsExist();

    if (hasNewColumns) {
      // Update with all fields
      await prisma.$executeRaw`
        UPDATE "Settings" 
        SET "registrationOpen" = ${registrationOpen ?? false},
            "registrationMessage" = ${registrationMessage ?? "Registration opens on March 1st, 2026"},
            "showTbaTeachers" = ${showTbaTeachers ?? false},
            "tbaTeachersCount" = ${tbaTeachersCount ?? 3},
            "updatedAt" = NOW()
        WHERE id = 'settings'
      `;
    } else {
      // Update only basic fields
      await prisma.$executeRaw`
        UPDATE "Settings" 
        SET "registrationOpen" = ${registrationOpen ?? false},
            "registrationMessage" = ${registrationMessage ?? "Registration opens on March 1st, 2026"},
            "updatedAt" = NOW()
        WHERE id = 'settings'
      `;
    }

    // Return the updated settings
    const settings: any = await prisma.$queryRaw`
      SELECT * FROM "Settings" WHERE id = 'settings' LIMIT 1
    `;

    const setting = settings[0];
    
    return NextResponse.json({
      id: setting.id,
      registrationOpen: setting.registrationOpen || false,
      registrationMessage: setting.registrationMessage || "Registration opens on March 1st, 2026",
      showTbaTeachers: setting.showTbaTeachers ?? showTbaTeachers ?? false,
      tbaTeachersCount: setting.tbaTeachersCount ?? tbaTeachersCount ?? 3,
      updatedAt: setting.updatedAt,
    });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings", details: error.message },
      { status: 500 }
    );
  }
}
