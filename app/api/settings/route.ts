import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_SETTINGS = {
  id: "settings",
  registrationOpen: false,
  registrationMessage: "Registration opens on March 1st, 2026",
  showTbaTeachers: false,
  tbaTeachersCount: 3,
  fridayHall1MapUrl: null,
  fridayHall2MapUrl: null,
  saturdayHall1MapUrl: null,
  saturdayHall2MapUrl: null,
  fridayHall1Name: null,
  fridayHall2Name: null,
  saturdayHall1Name: null,
  saturdayHall2Name: null,
  fridayHall1Image: null,
  fridayHall2Image: null,
  saturdayHall1Image: null,
  saturdayHall2Image: null,
};

function mapSetting(setting: any, overrides: Record<string, any> = {}) {
  return {
    id: setting.id,
    registrationOpen: setting.registrationOpen || false,
    registrationMessage: setting.registrationMessage || DEFAULT_SETTINGS.registrationMessage,
    showTbaTeachers: setting.showTbaTeachers ?? false,
    tbaTeachersCount: setting.tbaTeachersCount ?? 3,
    fridayHall1MapUrl: setting.fridayHall1MapUrl ?? overrides.fridayHall1MapUrl ?? null,
    fridayHall2MapUrl: setting.fridayHall2MapUrl ?? overrides.fridayHall2MapUrl ?? null,
    saturdayHall1MapUrl: setting.saturdayHall1MapUrl ?? overrides.saturdayHall1MapUrl ?? null,
    saturdayHall2MapUrl: setting.saturdayHall2MapUrl ?? overrides.saturdayHall2MapUrl ?? null,
    fridayHall1Name: setting.fridayHall1Name ?? overrides.fridayHall1Name ?? null,
    fridayHall2Name: setting.fridayHall2Name ?? overrides.fridayHall2Name ?? null,
    saturdayHall1Name: setting.saturdayHall1Name ?? overrides.saturdayHall1Name ?? null,
    saturdayHall2Name: setting.saturdayHall2Name ?? overrides.saturdayHall2Name ?? null,
    fridayHall1Image: setting.fridayHall1Image ?? overrides.fridayHall1Image ?? null,
    fridayHall2Image: setting.fridayHall2Image ?? overrides.fridayHall2Image ?? null,
    saturdayHall1Image: setting.saturdayHall1Image ?? overrides.saturdayHall1Image ?? null,
    saturdayHall2Image: setting.saturdayHall2Image ?? overrides.saturdayHall2Image ?? null,
    updatedAt: setting.updatedAt,
  };
}

// GET settings (public)
export async function GET() {
  try {
    const settings: any = await prisma.$queryRaw`
      SELECT * FROM "Settings" WHERE id = 'settings' LIMIT 1
    `;

    if (!settings || settings.length === 0) {
      try {
        await prisma.$executeRaw`
          INSERT INTO "Settings" (id, "registrationOpen", "registrationMessage", "updatedAt")
          VALUES ('settings', false, 'Registration opens on March 1st, 2026', NOW())
        `;
      } catch (e) {
        // Already exists — ignore
      }
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json(mapSetting(settings[0]));
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

// Column-existence helpers
async function checkTbaColumnsExist(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT "showTbaTeachers", "tbaTeachersCount" FROM "Settings" LIMIT 1`;
    return true;
  } catch { return false; }
}

async function checkHallMapColumnsExist(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT "fridayHall1MapUrl" FROM "Settings" LIMIT 1`;
    return true;
  } catch { return false; }
}

async function checkHallLocationColumnsExist(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT "fridayHall1Name", "fridayHall1Image" FROM "Settings" LIMIT 1`;
    return true;
  } catch { return false; }
}

// PUT update settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      registrationOpen, registrationMessage, showTbaTeachers, tbaTeachersCount,
      fridayHall1MapUrl, fridayHall2MapUrl, saturdayHall1MapUrl, saturdayHall2MapUrl,
      fridayHall1Name, fridayHall2Name, saturdayHall1Name, saturdayHall2Name,
      fridayHall1Image, fridayHall2Image, saturdayHall1Image, saturdayHall2Image,
    } = body;

    const [hasTba, hasHallMap, hasHallLocation] = await Promise.all([
      checkTbaColumnsExist(),
      checkHallMapColumnsExist(),
      checkHallLocationColumnsExist(),
    ]);

    if (hasTba && hasHallMap && hasHallLocation) {
      await prisma.$executeRaw`
        UPDATE "Settings"
        SET "registrationOpen"    = ${registrationOpen ?? false},
            "registrationMessage" = ${registrationMessage ?? DEFAULT_SETTINGS.registrationMessage},
            "showTbaTeachers"     = ${showTbaTeachers ?? false},
            "tbaTeachersCount"    = ${tbaTeachersCount ?? 3},
            "fridayHall1MapUrl"   = ${fridayHall1MapUrl ?? null},
            "fridayHall2MapUrl"   = ${fridayHall2MapUrl ?? null},
            "saturdayHall1MapUrl" = ${saturdayHall1MapUrl ?? null},
            "saturdayHall2MapUrl" = ${saturdayHall2MapUrl ?? null},
            "fridayHall1Name"     = ${fridayHall1Name ?? null},
            "fridayHall2Name"     = ${fridayHall2Name ?? null},
            "saturdayHall1Name"   = ${saturdayHall1Name ?? null},
            "saturdayHall2Name"   = ${saturdayHall2Name ?? null},
            "fridayHall1Image"    = ${fridayHall1Image ?? null},
            "fridayHall2Image"    = ${fridayHall2Image ?? null},
            "saturdayHall1Image"  = ${saturdayHall1Image ?? null},
            "saturdayHall2Image"  = ${saturdayHall2Image ?? null},
            "updatedAt"           = NOW()
        WHERE id = 'settings'
      `;
    } else if (hasTba && hasHallMap) {
      await prisma.$executeRaw`
        UPDATE "Settings"
        SET "registrationOpen"    = ${registrationOpen ?? false},
            "registrationMessage" = ${registrationMessage ?? DEFAULT_SETTINGS.registrationMessage},
            "showTbaTeachers"     = ${showTbaTeachers ?? false},
            "tbaTeachersCount"    = ${tbaTeachersCount ?? 3},
            "fridayHall1MapUrl"   = ${fridayHall1MapUrl ?? null},
            "fridayHall2MapUrl"   = ${fridayHall2MapUrl ?? null},
            "saturdayHall1MapUrl" = ${saturdayHall1MapUrl ?? null},
            "saturdayHall2MapUrl" = ${saturdayHall2MapUrl ?? null},
            "updatedAt"           = NOW()
        WHERE id = 'settings'
      `;
    } else if (hasTba) {
      await prisma.$executeRaw`
        UPDATE "Settings"
        SET "registrationOpen"    = ${registrationOpen ?? false},
            "registrationMessage" = ${registrationMessage ?? DEFAULT_SETTINGS.registrationMessage},
            "showTbaTeachers"     = ${showTbaTeachers ?? false},
            "tbaTeachersCount"    = ${tbaTeachersCount ?? 3},
            "updatedAt"           = NOW()
        WHERE id = 'settings'
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE "Settings"
        SET "registrationOpen"    = ${registrationOpen ?? false},
            "registrationMessage" = ${registrationMessage ?? DEFAULT_SETTINGS.registrationMessage},
            "updatedAt"           = NOW()
        WHERE id = 'settings'
      `;
    }

    const updated: any = await prisma.$queryRaw`
      SELECT * FROM "Settings" WHERE id = 'settings' LIMIT 1
    `;

    return NextResponse.json(mapSetting(updated[0], body));
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings", details: error.message },
      { status: 500 }
    );
  }
}
