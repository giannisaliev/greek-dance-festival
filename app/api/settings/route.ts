import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET settings (public)
export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: "settings" },
    });

    // Create default settings if they don't exist
    if (!settings) {
      try {
        settings = await prisma.settings.create({
          data: {
            id: "settings",
            registrationOpen: false,
            registrationMessage: "Registration opens on March 1st, 2026",
            showTbaTeachers: false,
            tbaTeachersCount: 3,
          },
        });
      } catch (createError: any) {
        // If new fields don't exist in schema yet, create without them
        if (createError.message?.includes('Unknown field')) {
          settings = await prisma.settings.create({
            data: {
              id: "settings",
              registrationOpen: false,
              registrationMessage: "Registration opens on March 1st, 2026",
            },
          });
        } else {
          throw createError;
        }
      }
    }

    // Ensure all fields exist (for backwards compatibility)
    const response = {
      id: settings.id,
      registrationOpen: settings.registrationOpen,
      registrationMessage: settings.registrationMessage,
      showTbaTeachers: (settings as any).showTbaTeachers ?? false,
      tbaTeachersCount: (settings as any).tbaTeachersCount ?? 3,
      updatedAt: settings.updatedAt,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    // Return default values if there's an error
    return NextResponse.json({
      id: "settings",
      registrationOpen: false,
      registrationMessage: "Registration opens on March 1st, 2026",
      showTbaTeachers: false,
      tbaTeachersCount: 3,
    });
  }
}

// PUT update settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationOpen, registrationMessage, showTbaTeachers, tbaTeachersCount } = body;

    // Try to update with all fields
    try {
      const settings = await prisma.settings.upsert({
        where: { id: "settings" },
        update: {
          registrationOpen: registrationOpen ?? undefined,
          registrationMessage: registrationMessage ?? undefined,
          showTbaTeachers: showTbaTeachers ?? undefined,
          tbaTeachersCount: tbaTeachersCount ?? undefined,
        },
        create: {
          id: "settings",
          registrationOpen: registrationOpen ?? false,
          registrationMessage: registrationMessage ?? "Registration opens on March 1st, 2026",
          showTbaTeachers: showTbaTeachers ?? false,
          tbaTeachersCount: tbaTeachersCount ?? 3,
        },
      });

      return NextResponse.json(settings);
    } catch (updateError: any) {
      // If new fields don't exist, update without them
      if (updateError.message?.includes('Unknown field')) {
        const settings = await prisma.settings.upsert({
          where: { id: "settings" },
          update: {
            registrationOpen: registrationOpen ?? undefined,
            registrationMessage: registrationMessage ?? undefined,
          },
          create: {
            id: "settings",
            registrationOpen: registrationOpen ?? false,
            registrationMessage: registrationMessage ?? "Registration opens on March 1st, 2026",
          },
        });

        return NextResponse.json({
          ...settings,
          showTbaTeachers: showTbaTeachers ?? false,
          tbaTeachersCount: tbaTeachersCount ?? 3,
        });
      }
      throw updateError;
    }
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings", details: error.message },
      { status: 500 }
    );
  }
}
