import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

type StudioLogo = {
  fileName: string;
  displayName: string;
  logoUrl: string;
};

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);

function toDisplayName(fileName: string): string {
  const noExt = fileName.replace(/\.[^.]+$/, "");
  const stripped = noExt.replace(/^\d+(?:-\d+)*-/, "");
  const normalized = stripped.replace(/[_-]+/g, " ").trim();
  return normalized || noExt;
}

function buildLogoUrl(fileName: string): string {
  return `/Studios/${encodeURIComponent(fileName)}`;
}

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

    const studiosDir = path.join(process.cwd(), "public", "Studios");
    const entries = await fs.readdir(studiosDir, { withFileTypes: true });

    const studios: StudioLogo[] = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((fileName) => ALLOWED_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
      .map((fileName) => ({
        fileName,
        displayName: toDisplayName(fileName),
        logoUrl: buildLogoUrl(fileName),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return NextResponse.json({ studios });
  } catch (error) {
    console.error("Studio certificate list error:", error);
    return NextResponse.json({ error: "Failed to load studio logos" }, { status: 500 });
  }
}
