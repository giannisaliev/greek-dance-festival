import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/class-checkins?scheduleId=xxx  -> list of check-ins for one class
// GET /api/class-checkins                 -> { counts: { [scheduleId]: number } } across all classes
export async function GET(request: NextRequest) {
  try {
    const scheduleId = request.nextUrl.searchParams.get("scheduleId");

    if (scheduleId) {
      const checkIns = await prisma.classCheckIn.findMany({
        where: { scheduleId },
        include: {
          participant: {
            select: {
              id: true,
              registrantFirstName: true,
              registrantLastName: true,
              studioName: true,
              packageType: true,
              user: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return NextResponse.json({ checkIns });
    }

    // No scheduleId: return attendance counts per class
    const grouped = await prisma.classCheckIn.groupBy({
      by: ["scheduleId"],
      _count: { _all: true },
    });

    const counts: Record<string, number> = {};
    grouped.forEach((g) => {
      counts[g.scheduleId] = g._count._all;
    });

    return NextResponse.json({ counts });
  } catch (error) {
    console.error("Error fetching class check-ins:", error);
    return NextResponse.json({ checkIns: [], counts: {} }, { status: 500 });
  }
}

// POST /api/class-checkins
//   Registered participant: { scheduleId, participantId }
//   Walk-in (non-registered): { scheduleId, firstName, lastName, phone? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleId, participantId, firstName, lastName, phone } = body;

    if (!scheduleId) {
      return NextResponse.json({ error: "scheduleId is required" }, { status: 400 });
    }

    // Make sure the class exists
    const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    if (participantId) {
      // Registered participant — prevent duplicate check-in for the same class
      const existing = await prisma.classCheckIn.findFirst({
        where: { scheduleId, participantId },
      });
      if (existing) {
        return NextResponse.json(
          { error: "This participant is already checked in for this class" },
          { status: 409 }
        );
      }

      const participant = await prisma.participant.findFirst({
        where: { id: participantId, deletedAt: null },
      });
      if (!participant) {
        return NextResponse.json({ error: "Participant not found" }, { status: 404 });
      }

      const checkIn = await prisma.classCheckIn.create({
        data: { scheduleId, participantId },
      });
      return NextResponse.json({ checkIn }, { status: 201 });
    }

    // Walk-in (non-registered attendee)
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required for a walk-in" },
        { status: 400 }
      );
    }

    const checkIn = await prisma.classCheckIn.create({
      data: {
        scheduleId,
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        phone: phone ? String(phone).trim() : null,
      },
    });

    return NextResponse.json({ checkIn }, { status: 201 });
  } catch (error) {
    console.error("Error creating class check-in:", error);
    return NextResponse.json({ error: "Failed to add check-in" }, { status: 500 });
  }
}

// DELETE /api/class-checkins?id=xxx -> remove a single check-in
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Check-in id is required" }, { status: 400 });
    }

    await prisma.classCheckIn.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting class check-in:", error);
    return NextResponse.json({ error: "Failed to remove check-in" }, { status: 500 });
  }
}
