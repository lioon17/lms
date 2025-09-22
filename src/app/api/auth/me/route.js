// src/app/api/auth/me/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/jwt";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get(process.env.COOKIE_NAME || "session")?.value;

  const session = token ? verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  return NextResponse.json({ authenticated: true, user: session }, { status: 200 });
}
