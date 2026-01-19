import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all students registered by this user (where registeredBy = user.id)
    const students = await prisma.user.findMany({
      where: {
        participant: {
          registeredBy: user.id
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        participant: {
          select: {
            id: true,
            registrantFirstName: true,
            registrantLastName: true,
            phone: true,
            packageType: true,
            guinnessRecordAttempt: true,
            greekNight: true,
            totalPrice: true,
            checkedIn: true,
            createdAt: true
          }
        }
      }
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching registered students:", error);
    return NextResponse.json(
      { error: "Failed to fetch registered students" },
      { status: 500 }
    );
  }
}
