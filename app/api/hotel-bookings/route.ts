import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { sendHotelBookingConfirmation, sendHotelBookingAdminConfirmation } from "@/lib/email";

// GET - Fetch all hotel bookings (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bookings = await prisma.hotelBooking.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching hotel bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch hotel bookings" },
      { status: 500 }
    );
  }
}

// POST - Create a new hotel booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      hotelId,
      hotelName,
      roomType,
      guestNames,
      email,
      phone,
      checkIn,
      checkOut,
      specialRequests,
    } = body;

    // Validate required fields
    if (
      !hotelId ||
      !hotelName ||
      !roomType ||
      !guestNames ||
      !Array.isArray(guestNames) ||
      guestNames.length === 0 ||
      guestNames.some((name: string) => !name || name.trim() === "") ||
      !email ||
      !phone ||
      !checkIn ||
      !checkOut
    ) {
      console.error("Validation failed:", {
        hotelId: !!hotelId,
        hotelName: !!hotelName,
        roomType: !!roomType,
        guestNames: guestNames,
        hasGuestNames: !!guestNames,
        isArray: Array.isArray(guestNames),
        length: guestNames?.length,
        emptyGuests: guestNames?.filter((n: string) => !n || n.trim() === ""),
        email: !!email,
        phone: !!phone,
        checkIn: !!checkIn,
        checkOut: !!checkOut
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (checkInDate < now) {
      return NextResponse.json(
        { error: "Check-in date cannot be in the past" },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: "Check-out date must be after check-in date" },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.hotelBooking.create({
      data: {
        hotelId,
        hotelName,
        roomType,
        guestNames,
        email,
        phone,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        specialRequests: specialRequests || null,
        status: "pending",
      },
    });

    // Send confirmation email to guest
    try {
      console.log("Attempting to send booking confirmation email to:", email);
      console.log("EMAIL_USER configured:", process.env.EMAIL_USER ? "Yes" : "No");
      console.log("EMAIL_HOST configured:", process.env.EMAIL_HOST ? "Yes" : "No");
      const result = await sendHotelBookingConfirmation({
        hotelName,
        roomType,
        guestNames,
        email,
        phone,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        specialRequests,
      });
      console.log("Booking confirmation email result:", result);
    } catch (emailError) {
      console.error("Failed to send booking confirmation email:", emailError);
      console.error("Email error details:", emailError instanceof Error ? emailError.message : String(emailError));
      // Don't fail the booking if email fails
    }

    // Send admin notification email
    try {
      console.log("Attempting to send admin notification email to:", process.env.ADMIN_EMAIL);
      const adminResult = await sendHotelBookingAdminConfirmation({
        hotelName,
        roomType,
        guestNames,
        email,
        phone,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        specialRequests,
        bookingId: booking.id,
      });
      console.log("Admin notification email result:", adminResult);
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
      console.error("Admin email error details:", emailError instanceof Error ? emailError.message : String(emailError));
      // Don't fail the booking if email fails
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("Error creating hotel booking:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Failed to create hotel booking", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH - Update booking status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing booking ID or status" },
        { status: 400 }
      );
    }

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const booking = await prisma.hotelBooking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Error updating hotel booking:", error);
    return NextResponse.json(
      { error: "Failed to update hotel booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    await prisma.hotelBooking.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hotel booking:", error);
    return NextResponse.json(
      { error: "Failed to delete hotel booking" },
      { status: 500 }
    );
  }
}
