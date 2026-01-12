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
      settings = await prisma.settings.create({
        data: {
          id: "settings",
          registrationOpen: false,
          registrationMessage: "Registration opens on March 1st, 2026",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT update settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationOpen, registrationMessage } = body;

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

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
