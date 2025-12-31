// src/app/api/auth/session/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/jwt";

export async function GET() {
  const cookieStore = await cookies(); // ⬅️ await is required
  const token = cookieStore.get(process.env.COOKIE_NAME || "session")?.value;

  if (!token) {
    return NextResponse.json({ authorized: false }, { status: 200 });
  }

  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ authorized: false }, { status: 200 });
  }

  return NextResponse.json(
    {
      authorized: true,
      userId: session.id,
      role: session.role,
      name: session.name,
      email: session.email,
    },
    { status: 200 }
  );
}