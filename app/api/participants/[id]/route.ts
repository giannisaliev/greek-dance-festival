import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isAdmin: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const participant = await prisma.participant.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Check if user owns this registration or is the one who registered it or is admin
    const isOwner = participant.userId === currentUser.id;
    const isRegistrant = participant.registeredBy === currentUser.id;
    const isAdmin = currentUser.isAdmin;

    if (!isOwner && !isRegistrant && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      registrantFirstName,
      registrantLastName,
      studioName,
      packageType,
      guinnessRecordAttempt,
      greekNight,
      totalPrice,
      checkedIn,
    } = body;

    const updateData: any = {};
    if (registrantFirstName !== undefined)
      updateData.registrantFirstName = registrantFirstName;
    if (registrantLastName !== undefined)
      updateData.registrantLastName = registrantLastName;
    if (studioName !== undefined) updateData.studioName = studioName;
    if (packageType !== undefined) updateData.packageType = packageType;
    if (guinnessRecordAttempt !== undefined)
      updateData.guinnessRecordAttempt = guinnessRecordAttempt;
    if (greekNight !== undefined) updateData.greekNight = greekNight;
    if (totalPrice !== undefined) updateData.totalPrice = totalPrice;
    if (checkedIn !== undefined && isAdmin) updateData.checkedIn = checkedIn;

    const updated = await prisma.participant.update({
      where: { id },
      data: updateData,
      include: { user: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating participant:", error);
    return NextResponse.json(
      { error: "Failed to update participant", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isAdmin: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const participant = await prisma.participant.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Check if user owns this registration or is the one who registered it or is admin
    const isOwner = participant.userId === currentUser.id;
    const isRegistrant = participant.registeredBy === currentUser.id;
    const isAdmin = currentUser.isAdmin;

    if (!isOwner && !isRegistrant && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    await prisma.participant.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Participant deleted. Will be permanently removed after 7 days.",
    });
  } catch (error: any) {
    console.error("Error deleting participant:", error);
    return NextResponse.json(
      { error: "Failed to delete participant", details: error.message },
      { status: 500 }
    );
  }
}
