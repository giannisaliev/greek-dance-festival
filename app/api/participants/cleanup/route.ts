import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// Permanently delete participants that have been soft-deleted for more than 7 days
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find participants to delete
    const toDelete = await prisma.participant.findMany({
      where: {
        deletedAt: {
          lte: sevenDaysAgo,
        },
      },
      select: { id: true, deletedAt: true },
    });

    // Permanently delete them
    const deleted = await prisma.participant.deleteMany({
      where: {
        deletedAt: {
          lte: sevenDaysAgo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Permanently deleted ${deleted.count} participants`,
      count: deleted.count,
      items: toDelete,
    });
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Cleanup failed", details: error.message },
      { status: 500 }
    );
  }
}
