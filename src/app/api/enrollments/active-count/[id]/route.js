// app/api/enrollments/active-count/[id]/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req, ctx) {
  try {
    // IMPORTANT: await dynamic params
    const p = await ctx?.params;
    const idRaw = p?.userId ?? p?.userid ?? p?.id; // supports [userId] | [userid] | [id]
    const userId = Number(idRaw);

    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid or missing userId." }, { status: 400 });
    }

    const [rows] = await db.execute(
      `SELECT COUNT(*) AS active_count
       FROM enrollments
       WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    const active_count = Number(rows?.[0]?.active_count ?? 0);
    return NextResponse.json({ user_id: userId, active_count }, { status: 200 });
  } catch (error) {
    console.error("GET /active-count error:", error);
    return NextResponse.json(
      { error: error?.sqlMessage || error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
