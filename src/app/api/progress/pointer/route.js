import { NextResponse } from "next/server";
import db from "@/lib/db";

/**
 * GET /api/progress/pointer?userId=5&courseId=1
 * Returns the last location a user viewed in a course.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const courseId = searchParams.get("courseId");
    if (!userId || !courseId)
      return NextResponse.json({ error: "userId and courseId required" }, { status: 400 });

    const [rows] = await db.execute(
      `SELECT * FROM progress_pointers WHERE user_id=? AND course_id=?`,
      [userId, courseId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "No pointer found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("GET /progress/pointer error:", err);
    return NextResponse.json({ error: "Failed to fetch pointer" }, { status: 500 });
  }
}

/**
 * PATCH /api/progress/pointer
 * Update or insert the user's last viewed entity.
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { user_id, course_id, last_entity_type, last_entity_id } = body || {};
    if (!user_id || !course_id || !last_entity_type || !last_entity_id)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    await db.execute(
      `INSERT INTO progress_pointers (user_id, course_id, last_entity_type, last_entity_id, last_seen_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE last_entity_type=VALUES(last_entity_type),
                               last_entity_id=VALUES(last_entity_id),
                               last_seen_at=NOW()`,
      [user_id, course_id, last_entity_type, last_entity_id]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /progress/pointer error:", err);
    return NextResponse.json({ error: "Failed to update pointer" }, { status: 500 });
  }
}
