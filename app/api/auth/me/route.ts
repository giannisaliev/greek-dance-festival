import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    let user: any;
    let isAdmin = false;
    
    try {
      // Try to fetch with isAdmin field
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isAdmin: true,
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
              createdAt: true,
              studioName: true
            }
          },
        },
      });
      isAdmin = Boolean(user?.isAdmin);
    } catch (selectError: any) {
      console.log("Error fetching with isAdmin, trying without:", selectError?.message);
      // Fallback: fetch without isAdmin field
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
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
              createdAt: true,
              studioName: true
            }
          },
        },
      });
      isAdmin = false;
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: isAdmin,
        participant: user.participant,
      },
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    return NextResponse.json(
      { error: "Failed to get user", details: error?.message },
      { status: 500 }
    );
  }
}
