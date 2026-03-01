import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

// GET - Fetch all dance studios (public)
export async function GET() {
  try {
    const studios = await prisma.danceStudio.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ studios });
  } catch (error) {
    console.error("Error fetching dance studios:", error);
    return NextResponse.json(
      { error: "Failed to fetch dance studios" },
      { status: 500 }
    );
  }
}

// POST - Create a new dance studio (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { isAdmin: true },
    });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, logo, country, countryCode, order } = body;

    if (!name || !logo || !country || !countryCode) {
      return NextResponse.json(
        { error: "Missing required fields: name, logo, country, countryCode" },
        { status: 400 }
      );
    }

    const studio = await prisma.danceStudio.create({
      data: { name, logo, country, countryCode, order: order ?? 0 },
    });

    return NextResponse.json({ studio }, { status: 201 });
  } catch (error) {
    console.error("Error creating dance studio:", error);
    return NextResponse.json(
      { error: "Failed to create dance studio" },
      { status: 500 }
    );
  }
}

// PUT - Update a dance studio (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { isAdmin: true },
    });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, logo, country, countryCode, order } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing studio id" }, { status: 400 });
    }

    const studio = await prisma.danceStudio.update({
      where: { id },
      data: { name, logo, country, countryCode, order: order ?? 0 },
    });

    return NextResponse.json({ studio });
  } catch (error) {
    console.error("Error updating dance studio:", error);
    return NextResponse.json(
      { error: "Failed to update dance studio" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a dance studio (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { isAdmin: true },
    });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing studio id" }, { status: 400 });
    }

    await prisma.danceStudio.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting dance studio:", error);
    return NextResponse.json(
      { error: "Failed to delete dance studio" },
      { status: 500 }
    );
  }
}
