import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { enrollment_id, entity_type, entity_id, seconds_spent = 0 } = body;

    if (!enrollment_id || !entity_type || !entity_id) {
      return NextResponse.json({ error: "Missing identifiers" }, { status: 400 });
    }

    await db.execute(
      `
      INSERT INTO progress_status
        (user_id, enrollment_id, entity_type, entity_id, status, pct_complete, seconds_spent, last_seen_at, completed_at)
      VALUES
        (0, ?, ?, ?, 'completed', 100.0, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        status = 'completed',
        pct_complete = 100.0,
        seconds_spent = seconds_spent + VALUES(seconds_spent),
        last_seen_at = NOW(),
        completed_at = IFNULL(completed_at, NOW())
      `,
      [enrollment_id, entity_type, entity_id, Number(seconds_spent)]
    );

    const [rows] = await db.execute(
      `SELECT * FROM progress_status WHERE enrollment_id=? AND entity_type=? AND entity_id=?`,
      [enrollment_id, entity_type, entity_id]
    );

    return NextResponse.json(rows[0], { status: 200 });
  } catch (e) {
    console.error("progress/complete error:", e);
    return NextResponse.json({ error: "Failed to complete entity" }, { status: 500 });
  }
}
