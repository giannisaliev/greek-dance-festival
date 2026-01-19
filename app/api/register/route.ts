import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRegistrationEmail } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function POST(request: NextRequest) {
  try {
    // Check if registration is open
    const settings = await prisma.settings.findUnique({
      where: { id: "settings" },
    });

    if (!settings?.registrationOpen) {
      return NextResponse.json(
        { error: "Registration is currently closed" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { phone, registrantFirstName, registrantLastName, packageType, guinnessRecordAttempt, greekNight, totalPrice } = body;
    
    // Get authenticated user from NextAuth session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to register" },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!phone || !packageType || !totalPrice) {
      return NextResponse.json(
        { error: "Phone, package type, and total price are required" },
        { status: 400 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { participant: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user already has a registration
    if (user.participant) {
      return NextResponse.json(
        { error: "You already have an active registration" },
        { status: 400 }
      );
    }

    // Create new participant
    const participant = await prisma.participant.create({
      data: {
        userId: user.id,
        registrantFirstName,
        registrantLastName,
        phone,
        packageType,
        guinnessRecordAttempt: guinnessRecordAttempt || false,
        greekNight: greekNight || false,
        totalPrice,
      },
    });

    // Send email notification
    await sendRegistrationEmail({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone,
      packageType,
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        participant: {
          id: participant.id,
          phone: participant.phone,
          packageType: participant.packageType,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
