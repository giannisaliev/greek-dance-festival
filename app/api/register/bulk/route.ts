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
    const { students, registrantType, studioName, teacherEmail, teacherFirstName, teacherLastName } = body;
    
    console.log("Bulk registration request:", { 
      studentsCount: students?.length,
      registrantType,
      studioName,
      teacherEmail
    });

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
      
      teacher = await prisma.user.create({
        data: {
          email: teacherEmail,
          firstName: teacherFirstName,
          lastName: teacherLastName,
          password: hashedPassword,
          isTeacher: true,
          studioName: registrantType === "studio" ? studioName : null
        },
        select: { id: true }
      });
    } else {
      // Update existing teacher's profile
      await prisma.user.update({
        where: { id: teacher.id },
        data: {
          isTeacher: true,
          studioName: registrantType === "studio" ? studioName : null
        }
      });
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
        if (!firstName || !lastName || !email || !packageType || totalPrice === undefined || totalPrice === null) {
          console.log("Validation failed for student:", { firstName, lastName, email, packageType, totalPrice });
          errors.push({ email: email || "unknown", error: "Missing required fields", details: { firstName: !!firstName, lastName: !!lastName, email: !!email, packageType: !!packageType, totalPrice: totalPrice } });
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
  } catch (error) {
    console.error("Bulk registration error:", error);
    return NextResponse.json(
      { error: "Bulk registration failed" },
      { status: 500 }
    );
  }
}
