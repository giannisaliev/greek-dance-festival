import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    // Restore the participant by clearing deletedAt and deletedBy
    const restored = await prisma.participant.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
      },
      include: { user: true },
    });

    return NextResponse.json(restored);
  } catch (error: any) {
    console.error("Error restoring participant:", error);
    return NextResponse.json(
      { error: "Failed to restore participant", details: error.message },
      { status: 500 }
    );
  }
}
