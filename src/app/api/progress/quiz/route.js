import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      enrollment_id,
      quiz_id,                // alias for entity_id
      passed,                 // boolean
      score,                  // optional number 0..100 (for display; not stored in schema)
      seconds_spent = 0
    } = body || {};

    if (!enrollment_id || !quiz_id || typeof passed !== "boolean") {
      return NextResponse.json({ error: "enrollment_id, quiz_id, passed required" }, { status: 400 });
    }

    const status = passed ? "passed" : "failed";

    await db.execute(
      `
      INSERT INTO progress_status
        (user_id, enrollment_id, entity_type, entity_id, status, pct_complete, seconds_spent, last_seen_at, completed_at)
      VALUES (0, ?, 'quiz', ?, ?, 100.00, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        status=VALUES(status),
        pct_complete=100.00,
        seconds_spent=seconds_spent + VALUES(seconds_spent),
        last_seen_at=NOW(),
        completed_at=IFNULL(completed_at, NOW())
      `,
      [enrollment_id, Number(quiz_id), status, Number(seconds_spent)]
    );

    const [rows] = await db.execute(
      `SELECT * FROM progress_status WHERE enrollment_id=? AND entity_type='quiz' AND entity_id=?`,
      [enrollment_id, Number(quiz_id)]
    );

    return NextResponse.json({
      ...rows[0],
      score: typeof score === "number" ? Number(score) : undefined
    });
  } catch (e) {
    console.error("progress/quiz error:", e);
    return NextResponse.json({ error: "Failed to record quiz result" }, { status: 500 });
  }
}
