import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query) {
      // Fetch participants (exclude soft-deleted)
      const participants = await prisma.participant.findMany({
        where: {
          deletedAt: null,
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

      // Get all unique teacher IDs
      const teacherIds = [...new Set(participants.map(p => p.registeredBy).filter(Boolean))];
      
      // Fetch teacher information only if there are teacher IDs
      let teachers: any[] = [];
      if (teacherIds.length > 0) {
        try {
          teachers = await prisma.user.findMany({
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
              isTeacher: true,
              studioName: true,
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
        } catch (teacherError) {
          console.error("Error fetching teachers:", teacherError);
          // Continue without teacher data if there's an error
        }
      }

      return NextResponse.json({ 
        participants: participants || [], 
        teachers: teachers || []
      });
    }

    // Search by participant name, phone, studio name, or teacher email (exclude soft-deleted)
    // Split query to handle full name searches (e.g., "Anna Avrami")
    const queryParts = query.trim().split(/\s+/);
    const hasMultipleParts = queryParts.length > 1;
    
    const searchConditions: any[] = [
      { registrantFirstName: { contains: query, mode: 'insensitive' as const } },
      { registrantLastName: { contains: query, mode: 'insensitive' as const } },
      { phone: { contains: query } },
      { studioName: { contains: query, mode: 'insensitive' as const } },
      // Search in user firstName and lastName for self-registered participants
      { user: { firstName: { contains: query, mode: 'insensitive' as const } } },
      { user: { lastName: { contains: query, mode: 'insensitive' as const } } },
    ];

    // If query has multiple parts, also search for first + last name combinations
    if (hasMultipleParts) {
      searchConditions.push({
        AND: [
          { registrantFirstName: { contains: queryParts[0], mode: 'insensitive' as const } },
          { registrantLastName: { contains: queryParts[queryParts.length - 1], mode: 'insensitive' as const } },
        ]
      });
      searchConditions.push({
        AND: [
          { user: { firstName: { contains: queryParts[0], mode: 'insensitive' as const } } },
          { user: { lastName: { contains: queryParts[queryParts.length - 1], mode: 'insensitive' as const } } },
        ]
      });
    }
    
    let participants = await prisma.participant.findMany({
      where: {
        AND: [
          { deletedAt: null },
          {
            OR: searchConditions,
          },
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

    // Also search by teacher email (users who have registered students)
    const teachersByEmail = await prisma.user.findMany({
      where: {
        email: { contains: query, mode: 'insensitive' },
      },
      select: { id: true },
    });

    // If teachers found by email, get their participants
    let participantsByTeacher: any[] = [];
    if (teachersByEmail.length > 0) {
      participantsByTeacher = await prisma.participant.findMany({
        where: {
          AND: [
            { deletedAt: null },
            { registeredBy: { in: teachersByEmail.map(t => t.id) } },
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
    }

    // Combine and deduplicate results
    const allParticipants = [...participants, ...participantsByTeacher];
    const uniqueParticipants = Array.from(
      new Map(allParticipants.map(p => [p.id, p])).values()
    );

    // Get all unique teacher IDs from search results
    const teacherIds = [...new Set(uniqueParticipants.map(p => p.registeredBy).filter(Boolean))];
    
    // Fetch teacher information only if there are teacher IDs
    let teachers: any[] = [];
    if (teacherIds.length > 0) {
      try {
        teachers = await prisma.user.findMany({
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
            isTeacher: true,
            studioName: true,
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
      } catch (teacherError) {
        console.error("Error fetching teachers in search:", teacherError);
        // Continue without teacher data if there's an error
      }
    }

    return NextResponse.json({ 
      participants: uniqueParticipants || [], 
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
