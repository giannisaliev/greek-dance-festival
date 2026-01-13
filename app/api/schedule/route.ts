import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch all schedule items
export async function GET() {
  try {
    const schedule = await prisma.schedule.findMany({
      orderBy: [
        { day: 'asc' },
        { time: 'asc' }
      ]
    });
    return NextResponse.json(schedule || []);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    // Return empty array on error to prevent frontend crashes
    return NextResponse.json([]);
  }
}

// POST - Create a new schedule item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { day, date, time, lecturer, danceStyle, level } = body;

    if (!day || !date || !time || !lecturer || !danceStyle || !level) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const scheduleItem = await prisma.schedule.create({
      data: {
        day,
        date,
        time,
        lecturer,
        danceStyle,
        level,
      },
    });

    return NextResponse.json(scheduleItem, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule item:", error);
    return NextResponse.json({ error: "Failed to create schedule item" }, { status: 500 });
  }
}

// PUT - Update a schedule item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, day, date, time, lecturer, danceStyle, level } = body;

    if (!id) {
      return NextResponse.json({ error: "Schedule ID is required" }, { status: 400 });
    }

    const scheduleItem = await prisma.schedule.update({
      where: { id },
      data: {
        day,
        date,
        time,
        lecturer,
        danceStyle,
        level,
      },
    });

    return NextResponse.json(scheduleItem);
  } catch (error) {
    console.error("Error updating schedule item:", error);
    return NextResponse.json({ error: "Failed to update schedule item" }, { status: 500 });
  }
}

// DELETE - Delete a schedule item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Schedule ID is required" }, { status: 400 });
    }

    await prisma.schedule.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Schedule item deleted successfully" });
  } catch (error) {
    console.error("Error deleting schedule item:", error);
    return NextResponse.json({ error: "Failed to delete schedule item" }, { status: 500 });
  }
}
