// app/api/progress/start/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";

// NEW: accept header OR body.user_id (fallback 0)
function getUserIdFromHeaderOrBody(request, body) {
  const hdr = request.headers.get("x-user-id");
  if (hdr) return Number(hdr);
  if (body && typeof body.user_id !== "undefined") return Number(body.user_id);
  return 0; // or throw if you prefer strict auth
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = getUserIdFromHeaderOrBody(request, body);

    const {
      enrollment_id,
      entity_type,
      entity_id,
      pct_complete,
      seconds_spent = 0,

      // pointer (be careful: last_entity_type must be 'lesson'|'section'|'quiz')
      course_id,
      last_entity_type,
      last_entity_id
    } = body || {};

    if (!enrollment_id || !entity_type || !entity_id) {
      return NextResponse.json({ error: "enrollment_id, entity_type, entity_id required" }, { status: 400 });
    }

    const pct = typeof pct_complete === "number" ? Math.min(100, Math.max(0, pct_complete)) : null;

    // upsert progress_status
    const [upd] = await db.execute(
      `UPDATE progress_status
         SET status='in_progress',
             pct_complete=IFNULL(?, pct_complete),
             seconds_spent=seconds_spent + ?,
             last_seen_at=NOW()
       WHERE enrollment_id=? AND entity_type=? AND entity_id=?`,
      [pct, seconds_spent, enrollment_id, entity_type, entity_id]
    );
    if (upd.affectedRows === 0) {
      await db.execute(
        `INSERT INTO progress_status
           (user_id, enrollment_id, entity_type, entity_id, status, pct_complete, seconds_spent, last_seen_at)
         VALUES (?, ?, ?, ?, 'in_progress', ?, ?, NOW())`,
        [userId, enrollment_id, entity_type, entity_id, pct ?? 0.0, seconds_spent]
      );
    }

    // optional pointer update (only if enum allows the type)
    if (course_id && last_entity_type && last_entity_id) {
      await db.execute(
        `INSERT INTO progress_pointers (user_id, course_id, last_entity_type, last_entity_id, last_seen_at)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           last_entity_type=VALUES(last_entity_type),
           last_entity_id=VALUES(last_entity_id),
           last_seen_at=NOW()`,
        [userId, Number(course_id), last_entity_type, Number(last_entity_id)]
      );
    }

    const [rows] = await db.execute(
      `SELECT * FROM progress_status WHERE enrollment_id=? AND entity_type=? AND entity_id=?`,
      [enrollment_id, entity_type, entity_id]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    console.error("progress/start error:", e);
    return NextResponse.json({ error: e.message || "Failed to start progress" }, { status: 500 });
  }
}
