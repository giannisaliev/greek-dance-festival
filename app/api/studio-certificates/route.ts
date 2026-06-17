import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

type StudioLogo = {
  fileName: string;
  displayName: string;
  logoUrl: string;
};

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

    // Studio logos live in the database (uploaded via the Dance Studios admin
    // page to Vercel Blob), not on the local filesystem. Read them from there so
    // the list works in production.
    const danceStudios = await prisma.danceStudio.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, logo: true },
    });

    const studios: StudioLogo[] = danceStudios
      .filter((studio) => studio.logo && studio.logo.trim().length > 0)
      .map((studio) => ({
        fileName: studio.id,
        displayName: studio.name,
        logoUrl: studio.logo,
      }));

    return NextResponse.json({ studios });
  } catch (error) {
    console.error("Studio certificate list error:", error);
    return NextResponse.json({ error: "Failed to load studio logos" }, { status: 500 });
  }
}
