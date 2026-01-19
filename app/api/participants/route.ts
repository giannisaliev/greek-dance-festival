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
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Get all unique teacher IDs
      const teacherIds = [...new Set(participants.map(p => p.registeredBy).filter(Boolean))];
      
      // Fetch teacher information
      const teachers = await prisma.user.findMany({
        where: {
          id: {
            in: teacherIds as string[]
          }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          participant: {
            select: {
              id: true,
              packageType: true,
              phone: true,
              guinnessRecordAttempt: true,
              greekNight: true,
              totalPrice: true,
              checkedIn: true,
              registrantFirstName: true,
              registrantLastName: true,
            }
          }
        }
      });

      return NextResponse.json({ 
        participants: participants || [], 
        teachers: teachers || []
      });
    }

    // Search by name, email, or phone
    const participants = await prisma.participant.findMany({
      where: {
        OR: [
          { user: { firstName: { contains: query, mode: 'insensitive' } } },
          { user: { lastName: { contains: query, mode: 'insensitive' } } },
          { user: { email: { contains: query, mode: 'insensitive' } } },
          { phone: { contains: query } },
          { registrantFirstName: { contains: query, mode: 'insensitive' } },
          { registrantLastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get all unique teacher IDs from search results
    const teacherIds = [...new Set(participants.map(p => p.registeredBy).filter(Boolean))];
    
    // Fetch teacher information
    const teachers = await prisma.user.findMany({
      where: {
        id: {
          in: teacherIds as string[]
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        participant: {
          select: {
            id: true,
            packageType: true,
            phone: true,
            guinnessRecordAttempt: true,
            greekNight: true,
            totalPrice: true,
            checkedIn: true,
            registrantFirstName: true,
            registrantLastName: true,
          }
        }
      }
    });

    return NextResponse.json({ 
      participants: participants || [], 
      teachers: teachers || []
    });
  } catch (error) {
    console.error("Search error:", error);
    // Return empty array on error to prevent frontend crashes
    return NextResponse.json(
      { participants: [], teachers: [], error: "Search failed" },
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
