// app/api/auth/signup/route.js
import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/queries/auth";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    const name = (body?.name || "").trim();
    const email = (body?.email || "").trim().toLowerCase();
    const password = body?.password || "";
    const role = (body?.role || "student").toLowerCase();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email, password are required" }, { status: 400 });
    }

    // Enforce allowed roles (must match your ENUM)
    const allowedRoles = new Set(["admin", "instructor", "student"]);
    const effectiveRole = allowedRoles.has(role) ? role : "student";

    // Uniqueness
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Hash -> password_hash (column name)
    const password_hash = await bcrypt.hash(password, 10);

    // Insert
    const userId = await createUser({ name, email, password_hash, role: effectiveRole });

    return NextResponse.json(
      { message: "User registered successfully", userId },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
