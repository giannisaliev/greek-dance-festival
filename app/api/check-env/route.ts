import { NextResponse } from "next/server";

// This endpoint helps debug if environment variables are set correctly
export async function GET() {
  const checks = {
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "not set",
    DATABASE_URL: !!process.env.DATABASE_URL,
  };

  // Show partial values (first 15 chars) for debugging without exposing secrets
  const partialValues = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.substring(0, 15) + "..." || "NOT SET",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
  };

  return NextResponse.json({
    message: "Environment Variables Status",
    allSet: Object.values(checks).every(v => v === true || typeof v === 'string'),
    checks,
    partialValues,
    tip: "All boolean values should be true. NEXTAUTH_URL should match your domain.",
  });
}
