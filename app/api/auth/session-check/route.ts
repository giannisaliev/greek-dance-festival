import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      authenticated: !!session,
      session: session ? {
        email: session.user?.email,
        isAdmin: (session.user as any)?.isAdmin,
        hasUser: !!session.user,
      } : null,
    });
  } catch (error) {
    return NextResponse.json({
      authenticated: false,
      error: String(error),
    });
  }
}
