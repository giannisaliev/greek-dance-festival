import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

// POST — record a certificate download (auth optional; records anonymous if not logged in)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { participantName, participantId, downloadedByRole, templateId } = body;

    if (!participantName || typeof participantName !== "string") {
      return NextResponse.json({ error: "participantName is required" }, { status: 400 });
    }

    // Resolve the authenticated downloader (may be anonymous for public self-downloads)
    const session = await getServerSession(authOptions);
    let downloadedById = "anonymous";
    let downloadedByName = "Anonymous";

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, firstName: true, lastName: true },
      });
      if (user) {
        downloadedById = user.id;
        downloadedByName = `${user.firstName} ${user.lastName}`.trim() || session.user.email;
      }
    }

    // Resolve participantId by name if not provided
    let resolvedParticipantId = participantId ?? null;
    if (!resolvedParticipantId) {
      const parts = participantName.trim().split(/\s+/);
      const first = parts[0] ?? "";
      const last = parts.slice(1).join(" ");

      const found = await prisma.participant.findFirst({
        where: {
          deletedAt: null,
          OR: [
            {
              AND: [
                { registrantFirstName: { equals: first, mode: "insensitive" } },
                { registrantLastName: { equals: last, mode: "insensitive" } },
              ],
            },
            {
              AND: [
                { user: { firstName: { equals: first, mode: "insensitive" } } },
                { user: { lastName: { equals: last, mode: "insensitive" } } },
              ],
            },
          ],
        },
        select: { id: true },
      });
      resolvedParticipantId = found?.id ?? "unknown";
    }

    await prisma.certificateDownload.create({
      data: {
        participantId: resolvedParticipantId,
        participantName: participantName.trim(),
        downloadedById,
        downloadedByName,
        downloadedByRole: downloadedByRole ?? "self",
        templateId: templateId ?? "flyer",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Certificate download record error:", error);
    return NextResponse.json({ error: "Failed to record download" }, { status: 500 });
  }
}

// GET — list all certificate downloads (admin only)
export async function GET() {
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const downloads = await prisma.certificateDownload.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    return NextResponse.json({ downloads });
  } catch (error) {
    console.error("Certificate download list error:", error);
    return NextResponse.json({ error: "Failed to fetch downloads" }, { status: 500 });
  }
}