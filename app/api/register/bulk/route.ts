import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRegistrationEmail } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import bcrypt from "bcryptjs";

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
    const { students } = body;
    
    // Get authenticated user (the teacher/studio owner)
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to register students" },
        { status: 401 }
      );
    }

    // Validate that students array is provided
    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: "At least one student is required" },
        { status: 400 }
      );
    }

    const registeredStudents = [];
    const errors = [];

    // Process each student
    for (const student of students) {
      try {
        const { firstName, lastName, email, packageType, guinnessRecordAttempt, greekNight, totalPrice } = student;

        // Validate required fields
        if (!firstName || !lastName || !email || !packageType || !totalPrice) {
          errors.push({ email, error: "Missing required fields" });
          continue;
        }

        // Check if user exists with this email
        let user = await prisma.user.findUnique({
          where: { email },
          include: { participant: true },
        });

        // If user doesn't exist, create them
        if (!user) {
          const randomPassword = crypto.randomUUID();
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          
          user = await prisma.user.create({
            data: {
              email,
              firstName,
              lastName,
              password: hashedPassword,
            },
            include: { participant: true },
          });
        }

        // Check if user already has a registration
        if (user.participant) {
          errors.push({ email, error: "Already registered" });
          continue;
        }

        // Create participant
        const participant = await prisma.participant.create({
          data: {
            userId: user.id,
            registrantFirstName: firstName,
            registrantLastName: lastName,
            phone: "", // Empty phone for bulk registrations
            packageType,
            guinnessRecordAttempt: guinnessRecordAttempt || false,
            greekNight: greekNight || false,
            totalPrice,
            registeredBy: (session.user as any).id, // Track who registered this participant
          },
        });

        // Send email notification
        await sendRegistrationEmail({
          firstName,
          lastName,
          email,
          phone: "", // No phone for bulk registrations
          packageType,
        });

        registeredStudents.push({
          email,
          firstName,
          lastName,
          participantId: participant.id,
        });
      } catch (err) {
        console.error(`Error registering student ${student.email}:`, err);
        errors.push({ 
          email: student.email, 
          error: err instanceof Error ? err.message : "Registration failed" 
        });
      }
    }

    if (registeredStudents.length === 0) {
      return NextResponse.json(
        { 
          error: "No students were registered", 
          details: errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: `Successfully registered ${registeredStudents.length} student(s)`,
        registered: registeredStudents,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk registration error:", error);
    return NextResponse.json(
      { error: "Bulk registration failed" },
      { status: 500 }
    );
  }
}
