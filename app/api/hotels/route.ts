import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// GET all hotels
export async function GET() {
  try {
    const hotels = await prisma.hotel.findMany({
      orderBy: {
        order: 'asc'
      }
    });
    return NextResponse.json({ hotels });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json(
      { error: "Failed to fetch hotels" },
      { status: 500 }
    );
  }
}

// POST create new hotel (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, stars, location, description, images, prices, amenities, order } = body;

    // Validate required fields
    if (!name || !stars || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const hotel = await prisma.hotel.create({
      data: {
        name,
        stars: parseInt(stars),
        location,
        description: description || "",
        images: images || [],
        prices: prices || {},
        amenities: amenities || [],
        order: order || 0
      }
    });

    return NextResponse.json({ hotel }, { status: 201 });
  } catch (error) {
    console.error("Error creating hotel:", error);
    return NextResponse.json(
      { error: "Failed to create hotel" },
      { status: 500 }
    );
  }
}

// DELETE hotel (admin only)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Hotel ID is required" },
        { status: 400 }
      );
    }

    await prisma.hotel.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Hotel deleted successfully" });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    return NextResponse.json(
      { error: "Failed to delete hotel" },
      { status: 500 }
    );
  }
}

// PUT update hotel (admin only)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, stars, location, description, images, prices, amenities, order } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Hotel ID is required" },
        { status: 400 }
      );
    }

    const hotel = await prisma.hotel.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(stars && { stars: parseInt(stars) }),
        ...(location && { location }),
        ...(description !== undefined && { description }),
        ...(images && { images }),
        ...(prices && { prices }),
        ...(amenities && { amenities }),
        ...(order !== undefined && { order })
      }
    });

    return NextResponse.json({ hotel });
  } catch (error) {
    console.error("Error updating hotel:", error);
    return NextResponse.json(
      { error: "Failed to update hotel" },
      { status: 500 }
    );
  }
}
