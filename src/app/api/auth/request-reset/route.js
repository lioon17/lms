import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/queries/auth";
import { createPasswordReset } from "@/lib/queries/passwordReset";
import { sendOtpEmail  } from "@/lib/email";

function genOtp() {
  // 6-digit numeric OTP
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req) {
  try {
    const { email } = await req.json();
    const normalized = (email || "").trim().toLowerCase();
    if (!normalized) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const user = await findUserByEmail(normalized);
    // Security note: Don't reveal whether the email exists.
    if (!user) {
      // Respond success anyway to avoid user enumeration
      return NextResponse.json({ message: "If that email exists, an OTP has been sent." }, { status: 200 });
    }

    const otp = genOtp();
    const expMin = Number(process.env.OTP_EXP_MIN || 3);
    const expiresAt = new Date(Date.now() + expMin * 60 * 1000);

    await createPasswordReset(normalized, otp, expiresAt);
   await sendOtpEmail(normalized, otp);

    return NextResponse.json({ message: "If that email exists, an OTP has been sent." }, { status: 200 });
  } catch (err) {
    console.error("request-reset error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
