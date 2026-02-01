import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { sendHotelBookingAdminConfirmation } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Get booking details
    const booking = await prisma.hotelBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Update booking status to confirmed
    const updatedBooking = await prisma.hotelBooking.update({
      where: { id },
      data: { status: "confirmed" },
    });

    // Send confirmation email
    await sendHotelBookingAdminConfirmation({
      bookingId: booking.id,
      hotelName: booking.hotelName,
      roomType: booking.roomType,
      guestNames: booking.guestNames,
      email: booking.email,
      phone: booking.phone,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      specialRequests: booking.specialRequests || undefined,
    });

    return NextResponse.json({ 
      success: true,
      booking: updatedBooking,
      message: "Confirmation email sent successfully" 
    });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return NextResponse.json(
      { error: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}
