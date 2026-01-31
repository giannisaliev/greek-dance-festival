import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendRegistrationEmail } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  console.log("=== BULK REGISTRATION START ===");
  try {
    const body = await request.json();
    console.log("Body received:", JSON.stringify(body, null, 2));
    
    const { students, registrantType, studioName, teacherEmail, teacherFirstName, teacherLastName } = body;
    
    console.log("Bulk registration request:", { 
      studentsCount: students?.length,
      registrantType,
      studioName,
      teacherEmail
    });

    // Get current session to check if user is admin
    const session = await getServerSession(authOptions);
    let isAdmin = false;
    
    if (session?.user) {
      try {
        const currentUser = await prisma.user.findUnique({
          where: { email: (session.user as any).email },
          select: { isAdmin: true }
        });
        isAdmin = Boolean(currentUser?.isAdmin);
      } catch (adminCheckError: any) {
        console.log("Could not check admin status (column may not exist), assuming not admin:", adminCheckError?.message);
        isAdmin = false;
      }
    }

    // Check if registration is open (skip check for admins)
    if (!isAdmin) {
      try {
        const settings = await prisma.settings.findUnique({
          where: { id: "settings" },
        });

        if (!settings?.registrationOpen) {
          return NextResponse.json(
            { error: "Registration is currently closed" },
            { status: 403 }
          );
        }
      } catch (settingsError: any) {
        console.error("Error checking settings:", settingsError?.message);
        return NextResponse.json(
          { error: "Could not verify registration status" },
          { status: 500 }
        );
      }
    }

    // Validate teacher information
    if (!teacherEmail || !teacherFirstName || !teacherLastName) {
      return NextResponse.json(
        { error: "Teacher contact information is required" },
        { status: 400 }
      );
    }
    
    // Find or create teacher account
    let teacher = await prisma.user.findUnique({
      where: { email: teacherEmail },
      select: { id: true }
    });

    if (!teacher) {
      // Create teacher account
      const randomPassword = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      try {
        teacher = await prisma.user.create({
          data: {
            email: teacherEmail,
            firstName: teacherFirstName,
            lastName: teacherLastName,
            password: hashedPassword,
          },
          select: { id: true }
        });
      } catch (createError: any) {
        console.error("Error creating teacher account:", createError);
        return NextResponse.json(
          { error: "Could not create teacher account", details: createError.message },
          { status: 500 }
        );
      }
    }
    // Note: Teacher account exists, no need to update with isTeacher/studioName fields

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
        let { firstName, lastName, email, packageType, guinnessRecordAttempt, greekNight, totalPrice } = student;

        // Validate required fields (email is now optional)
        if (!firstName || !lastName || !packageType || totalPrice === undefined || totalPrice === null) {
          console.log("Validation failed for student:", { firstName, lastName, packageType, totalPrice });
          errors.push({ email: email || `${firstName} ${lastName}`, error: "Missing required fields", details: { firstName: !!firstName, lastName: !!lastName, packageType: !!packageType, totalPrice: totalPrice } });
          continue;
        }

        // Generate unique email if not provided
        if (!email) {
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(7);
          email = `student.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}.${random}@greek-dance-festival.temp`;
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
            registeredBy: teacher.id, // Track who registered this participant
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
      console.error("No students registered. Errors:", errors);
      return NextResponse.json(
        { 
          error: "No students were registered", 
          details: errors,
          message: errors.length > 0 ? `All registrations failed: ${errors.map(e => e.error).join(', ')}` : "Unknown error"
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
  } catch (error: any) {
    console.error("Bulk registration error:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code
    });
    return NextResponse.json(
      { error: "Bulk registration failed", details: error?.message },
      { status: 500 }
    );
  }
}
