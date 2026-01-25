import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET all teachers
export async function GET() {
  try {
    // Try to fetch with order field, fall back to name only if it fails
    let teachers;
    try {
      teachers = await prisma.teacher.findMany({
        orderBy: [
          { order: 'asc' },
          { name: 'asc' },
        ],
      });
    } catch (error) {
      // Fallback if order column doesn't exist yet
      console.log("Order field not available, falling back to name sorting");
      teachers = await prisma.teacher.findMany({
        orderBy: {
          name: 'asc',
        },
      });
    }

    return NextResponse.json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

// POST - Create new teacher (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, image, teachingStyle, country, countryCode, imagePadding, instagram, facebook, order } = body;

    if (!name || !image || !teachingStyle || !country || !countryCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const teacherData: any = {
      name,
      image,
      teachingStyle,
      country,
      countryCode,
      imagePadding: imagePadding || 0,
      instagram: instagram || null,
      facebook: facebook || null,
    };
    
    // Only add order if it's provided (for backward compatibility)
    if (order !== undefined) {
      teacherData.order = order;
    }

    const teacher = await prisma.teacher.create({
      data: teacherData,
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json(
      { error: "Failed to create teacher" },
      { status: 500 }
    );
  }
}

// PUT - Update teacher (Admin only)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, image, teachingStyle, country, countryCode, imagePadding, instagram, facebook, order } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      name,
      image,
      teachingStyle,
      country,
      countryCode,
      imagePadding: imagePadding !== undefined ? imagePadding : 0,
      instagram: instagram || null,
      facebook: facebook || null,
    };
    
    // Only add order if it's provided (for backward compatibility)
    if (order !== undefined) {
      updateData.order = order;
    }

    const teacher = await prisma.teacher.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { error: "Failed to update teacher" },
      { status: 500 }
    );
  }
}

// DELETE - Delete teacher (Admin only)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    await prisma.teacher.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { error: "Failed to delete teacher" },
      { status: 500 }
    );
  }
}

// PATCH - Update teacher order (Admin only)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { teachers } = body;

    if (!Array.isArray(teachers)) {
      return NextResponse.json(
        { error: "Teachers array is required" },
        { status: 400 }
      );
    }

    // Update order for each teacher
    try {
      const updatePromises = teachers.map((teacher: { id: string; order: number }) =>
        prisma.teacher.update({
          where: { id: teacher.id },
          data: { order: teacher.order },
        })
      );

      await Promise.all(updatePromises);

      return NextResponse.json({ success: true });
    } catch (updateError) {
      // If order field doesn't exist yet, return success anyway
      console.log("Order update failed, migration may not have run yet", updateError);
      return NextResponse.json({ success: true, warning: "Order field not available yet" });
    }
  } catch (error) {
    console.error("Error updating teacher order:", error);
    return NextResponse.json(
      { error: "Failed to update teacher order" },
      { status: 500 }
    );
  }
}
