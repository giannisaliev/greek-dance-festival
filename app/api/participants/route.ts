import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query) {
      const participants = await prisma.participant.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ participants: participants || [] });
    }

    // Search by name, email, or phone
    const participants = await prisma.participant.findMany({
      where: {
        OR: [
          { user: { firstName: { contains: query } } },
          { user: { lastName: { contains: query } } },
          { user: { email: { contains: query } } },
          { phone: { contains: query } },
        ],
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ participants: participants || [] });
  } catch (error) {
    console.error("Search error:", error);
    // Return empty array on error to prevent frontend crashes
    return NextResponse.json(
      { participants: [], error: "Search failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, checkedIn } = body;

    if (!id || typeof checkedIn !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const participant = await prisma.participant.update({
      where: { id },
      data: { checkedIn },
    });

    return NextResponse.json({ participant });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}
