import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

// Track analytics event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, eventName, pagePath, metadata, sessionId } = body;

    if (!eventType || !eventName || !pagePath || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user info if logged in
    const session = await getServerSession(authOptions);
    
    let userId = null;
    let isAdmin = false;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, isAdmin: true },
      });
      if (user) {
        userId = user.id;
        isAdmin = user.isAdmin;
      }
    }

    // Don't track admin users
    if (isAdmin) {
      return NextResponse.json({ success: true, tracked: false });
    }

    // Get IP address
    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    // Get user agent
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Get referrer
    const referrer = request.headers.get("referer") || null;

    // Save analytics event
    await prisma.analytics.create({
      data: {
        userId,
        sessionId,
        eventType,
        eventName,
        pagePath,
        metadata: metadata || null,
        ipAddress,
        userAgent,
        referrer,
        isAdmin: false, // Already filtered above
      },
    });

    return NextResponse.json({ success: true, tracked: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    // Don't fail the request if analytics tracking fails
    return NextResponse.json({ success: true, tracked: false });
  }
}

// Get analytics data (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "7d"; // 24h, 7d, 30d, all
    const eventType = searchParams.get("eventType");

    // Calculate date filter
    let dateFilter: Date | undefined;
    const now = new Date();
    if (timeRange === "24h") {
      dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeRange === "7d") {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === "30d") {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build where clause
    const where: any = {
      isAdmin: false, // Exclude admin events
    };

    if (dateFilter) {
      where.createdAt = { gte: dateFilter };
    }

    if (eventType && eventType !== "all") {
      where.eventType = eventType;
    }

    // Get analytics data
    const events = await prisma.analytics.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1000, // Limit to prevent huge responses
    });

    // Get unique user IDs to fetch user details
    const userIds = [...new Set(events.filter(e => e.userId).map(e => e.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    // Calculate statistics
    const totalEvents = events.length;
    const uniqueSessions = new Set(events.map(e => e.sessionId)).size;
    const uniqueUsers = userIds.length;

    // Group by event type
    const eventsByType: Record<string, number> = {};
    events.forEach(event => {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
    });

    // Group by event name
    const eventsByName: Record<string, number> = {};
    events.forEach(event => {
      eventsByName[event.eventName] = (eventsByName[event.eventName] || 0) + 1;
    });

    // Group by page path
    const eventsByPage: Record<string, number> = {};
    events.forEach(event => {
      eventsByPage[event.pagePath] = (eventsByPage[event.pagePath] || 0) + 1;
    });

    // Top pages (sorted by count)
    const topPages = Object.entries(eventsByPage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    // Top events (sorted by count)
    const topEvents = Object.entries(eventsByName)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([event, count]) => ({ event, count }));

    // Events over time (grouped by day for 7d+, by hour for 24h)
    const groupByHour = timeRange === "24h";
    const eventsOverTime: Record<string, number> = {};
    events.forEach(event => {
      const date = new Date(event.createdAt);
      const key = groupByHour
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      eventsOverTime[key] = (eventsOverTime[key] || 0) + 1;
    });

    return NextResponse.json({
      statistics: {
        totalEvents,
        uniqueSessions,
        uniqueUsers,
        eventsByType,
        topPages,
        topEvents,
        eventsOverTime: Object.entries(eventsOverTime)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([time, count]) => ({ time, count })),
      },
      recentEvents: events.slice(0, 50).map(event => {
        const user = event.userId ? userMap.get(event.userId) : null;
        return {
          id: event.id,
          eventType: event.eventType,
          eventName: event.eventName,
          pagePath: event.pagePath,
          metadata: event.metadata,
          user: user ? `${user.firstName} ${user.lastName} (${user.email})` : "Anonymous",
          createdAt: event.createdAt,
        };
      }),
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { error: "Failed to get analytics" },
      { status: 500 }
    );
  }
}
