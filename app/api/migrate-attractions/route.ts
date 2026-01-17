import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

// One-time migration endpoint to add Attraction table
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Try to create the Attraction table using raw SQL
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Attraction" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "image" TEXT NOT NULL,
          "badge" TEXT NOT NULL,
          "order" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Attraction_pkey" PRIMARY KEY ("id")
        );
      `;

      return NextResponse.json({
        success: true,
        message: "Attraction table created successfully",
      });
    } catch (error) {
      console.error("Migration error:", error);
      return NextResponse.json(
        { error: "Failed to run migration", details: String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate", details: String(error) },
      { status: 500 }
    );
  }
}
