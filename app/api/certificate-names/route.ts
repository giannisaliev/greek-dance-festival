import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint for the Guinness Record certificate page.
// Returns ONLY participant display names (no phone/email/price/PII) that match
// the search query, so attendees can find their registered name. Requires a
// query of at least 2 characters and caps the number of results.
export async function GET(request: NextRequest) {
  try {
    const query = (request.nextUrl.searchParams.get("q") || "").trim();

    if (query.length < 2) {
      return NextResponse.json({ names: [] });
    }

    const queryParts = query.split(/\s+/).filter(Boolean);
    const insensitive = "insensitive" as const;

    const searchConditions: any[] = [
      { registrantFirstName: { contains: query, mode: insensitive } },
      { registrantLastName: { contains: query, mode: insensitive } },
      { user: { firstName: { contains: query, mode: insensitive } } },
      { user: { lastName: { contains: query, mode: insensitive } } },
    ];

    if (queryParts.length > 1) {
      const first = queryParts[0];
      const last = queryParts[queryParts.length - 1];
      searchConditions.push({
        AND: [
          { registrantFirstName: { contains: first, mode: insensitive } },
          { registrantLastName: { contains: last, mode: insensitive } },
        ],
      });
      searchConditions.push({
        AND: [
          { user: { firstName: { contains: first, mode: insensitive } } },
          { user: { lastName: { contains: last, mode: insensitive } } },
        ],
      });
    }

    const participants = await prisma.participant.findMany({
      where: {
        AND: [{ deletedAt: null }, { OR: searchConditions }],
      },
      select: {
        registrantFirstName: true,
        registrantLastName: true,
        user: { select: { firstName: true, lastName: true } },
      },
      take: 50,
    });

    // Prefer the registration name; fall back to the linked user account name.
    const names = participants
      .map((p) => {
        const first = (p.registrantFirstName || p.user?.firstName || "").trim();
        const last = (p.registrantLastName || p.user?.lastName || "").trim();
        return `${first} ${last}`.trim();
      })
      .filter((n) => n.length > 0);

    // De-duplicate (case-insensitive) and limit
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const n of names) {
      const key = n.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(n);
      }
    }
    unique.sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ names: unique.slice(0, 15) });
  } catch (error) {
    console.error("Certificate name search error:", error);
    return NextResponse.json({ names: [] }, { status: 500 });
  }
}
