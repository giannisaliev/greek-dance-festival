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
      fridayHall1MapUrl: setting.fridayHall1MapUrl ?? null,
      fridayHall2MapUrl: setting.fridayHall2MapUrl ?? null,
      saturdayHall1MapUrl: setting.saturdayHall1MapUrl ?? null,
      saturdayHall2MapUrl: setting.saturdayHall2MapUrl ?? null,
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
      fridayHall1MapUrl: null,
      fridayHall2MapUrl: null,
      saturdayHall1MapUrl: null,
      saturdayHall2MapUrl: null,
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

// Helper to check if hall map URL columns exist
async function checkHallMapColumnsExist(): Promise<boolean> {
  try {
    await prisma.$queryRaw`
      SELECT "fridayHall1MapUrl" FROM "Settings" LIMIT 1
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
    const { registrationOpen, registrationMessage, showTbaTeachers, tbaTeachersCount,
            fridayHall1MapUrl, fridayHall2MapUrl, saturdayHall1MapUrl, saturdayHall2MapUrl } = body;

    const hasTbaColumns = await checkTbaColumnsExist();
    const hasHallMapColumns = await checkHallMapColumnsExist();

    if (hasTbaColumns && hasHallMapColumns) {
      await prisma.$executeRaw`
        UPDATE "Settings"
        SET "registrationOpen" = ${registrationOpen ?? false},
            "registrationMessage" = ${registrationMessage ?? "Registration opens on March 1st, 2026"},
            "showTbaTeachers" = ${showTbaTeachers ?? false},
            "tbaTeachersCount" = ${tbaTeachersCount ?? 3},
            "fridayHall1MapUrl" = ${fridayHall1MapUrl ?? null},
            "fridayHall2MapUrl" = ${fridayHall2MapUrl ?? null},
            "saturdayHall1MapUrl" = ${saturdayHall1MapUrl ?? null},
            "saturdayHall2MapUrl" = ${saturdayHall2MapUrl ?? null},
            "updatedAt" = NOW()
        WHERE id = 'settings'
      `;
    } else if (hasTbaColumns) {
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
      fridayHall1MapUrl: setting.fridayHall1MapUrl ?? fridayHall1MapUrl ?? null,
      fridayHall2MapUrl: setting.fridayHall2MapUrl ?? fridayHall2MapUrl ?? null,
      saturdayHall1MapUrl: setting.saturdayHall1MapUrl ?? saturdayHall1MapUrl ?? null,
      saturdayHall2MapUrl: setting.saturdayHall2MapUrl ?? saturdayHall2MapUrl ?? null,
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
