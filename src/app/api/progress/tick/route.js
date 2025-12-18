import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      enrollment_id,
      entity_type,
      entity_id,
      seconds = 30,
      pct_complete // optional
    } = body || {};

    if (!enrollment_id || !entity_type || !entity_id) {
      return NextResponse.json({ error: "enrollment_id, entity_type, entity_id required" }, { status: 400 });
    }

    const pct = typeof pct_complete === "number" ? Math.min(100, Math.max(0, pct_complete)) : null;

    const [res] = await db.execute(
      `
      UPDATE progress_status
      SET seconds_spent = seconds_spent + ?,
          pct_complete = IFNULL(?, pct_complete),
          last_seen_at = NOW()
      WHERE enrollment_id=? AND entity_type=? AND entity_id=?
      `,
      [Number(seconds), pct, enrollment_id, entity_type, entity_id]
    );

    // If row missing, create it as in_progress
    if (res.affectedRows === 0) {
      await db.execute(
        `
        INSERT INTO progress_status
          (user_id, enrollment_id, entity_type, entity_id, status, pct_complete, seconds_spent, last_seen_at)
        VALUES (0, ?, ?, ?, 'in_progress', ?, ?, NOW())
        `,
        [enrollment_id, entity_type, entity_id, pct ?? 0.0, Number(seconds)]
      );
    }

    const [rows] = await db.execute(
      `SELECT * FROM progress_status WHERE enrollment_id=? AND entity_type=? AND entity_id=?`,
      [enrollment_id, entity_type, entity_id]
    );
    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error("progress/tick error:", e);
    return NextResponse.json({ error: "Failed to tick progress" }, { status: 500 });
  }
}
