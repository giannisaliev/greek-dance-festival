import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET all attractions
export async function GET() {
  try {
    const attractions = await prisma.attraction.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(attractions);
  } catch (error) {
    console.error("Error fetching attractions:", error);
    return NextResponse.json(
      { error: "Failed to fetch attractions" },
      { status: 500 }
    );
  }
}

// POST new attraction (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, image, badge, order } = body;

    const attraction = await prisma.attraction.create({
      data: {
        title,
        description,
        image,
        badge,
        order: order || 0,
      },
    });

    return NextResponse.json(attraction);
  } catch (error) {
    console.error("Error creating attraction:", error);
    return NextResponse.json(
      { error: "Failed to create attraction" },
      { status: 500 }
    );
  }
}

// PUT update attraction (admin only)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, description, image, badge, order } = body;

    const attraction = await prisma.attraction.update({
      where: { id },
      data: {
        title,
        description,
        image,
        badge,
        order,
      },
    });

    return NextResponse.json(attraction);
  } catch (error) {
    console.error("Error updating attraction:", error);
    return NextResponse.json(
      { error: "Failed to update attraction" },
      { status: 500 }
    );
  }
}

// DELETE attraction (admin only)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Attraction ID required" },
        { status: 400 }
      );
    }

    await prisma.attraction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attraction:", error);
    return NextResponse.json(
      { error: "Failed to delete attraction" },
      { status: 500 }
    );
  }
}
