// src/app/api/auth/logout/route.js
import { NextResponse } from "next/server";
import { sessionCookie } from "@/lib/jwt";

export async function POST() {
  const res = NextResponse.json({ message: "Signed out" }, { status: 200 });
  // Clear cookie by setting empty value and immediate expiry
  res.cookies.set(sessionCookie.name, "", { ...sessionCookie.options, maxAge: 0 });
  return res;
}
