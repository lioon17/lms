import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getLatestResetForEmail, deletePasswordResets, updateUserPasswordByEmail } from "@/lib/queries/passwordReset";
import { findUserByEmail } from "@/lib/queries/auth";
import bcryptjs from "bcryptjs"; // alias okay if you prefer just one import

export async function POST(req) {
  try {
    const { email, otp, new_password } = await req.json();

    const normalized = (email || "").trim().toLowerCase();
    if (!normalized || !otp || !new_password) {
      return NextResponse.json(
        { error: "email, otp, new_password are required" },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(normalized);
    if (!user) {
      // Don't reveal; act like invalid OTP
      return NextResponse.json({ error: "Invalid OTP or expired" }, { status: 400 });
    }

    const record = await getLatestResetForEmail(normalized);
    if (!record) {
      return NextResponse.json({ error: "Invalid OTP or expired" }, { status: 400 });
    }

    // Check expiry
    if (new Date(record.expires_at).getTime() < Date.now()) {
      await deletePasswordResets(normalized);
      return NextResponse.json({ error: "Invalid OTP or expired" }, { status: 400 });
    }

    // Compare OTP with stored hash
    const matches = await bcrypt.compare(String(otp), record.otp_hash);
    if (!matches) {
      return NextResponse.json({ error: "Invalid OTP or expired" }, { status: 400 });
    }

    // Update user password
    const password_hash = await bcrypt.hash(new_password, 10);
    const ok = await updateUserPasswordByEmail(normalized, password_hash);
    if (!ok) {
      return NextResponse.json({ error: "Password update failed" }, { status: 500 });
    }

    // Invalidate any pending OTPs for this email
    await deletePasswordResets(normalized);

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (err) {
    console.error("reset-password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
