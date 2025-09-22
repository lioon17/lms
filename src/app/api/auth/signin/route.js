// src/app/api/auth/signin/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/queries/auth"; // uses your DB pool & SELECT
import { signSession, sessionCookie } from "@/lib/jwt";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "email and password are required" }, { status: 400 });
    }

    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Your table uses `password_hash`
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create a minimal JWT payload
    const token = signSession({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const res = NextResponse.json(
      { message: "Signed in", user: { id: user.id, email: user.email, role: user.role, name: user.name } },
      { status: 200 }
    );

    // Set HTTP-only cookie
    res.cookies.set(sessionCookie.name, token, sessionCookie.options);
    return res;
  } catch (err) {
    console.error("signin error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
