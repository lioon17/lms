import { NextResponse } from "next/server";
import db from "@/lib/db";

function getUserId(request, body) {
  const hdr = request.headers.get("x-user-id");
  const id = hdr ? Number(hdr) : Number(body?.user_id);
  if (!Number.isFinite(id) || id <= 0) throw new Error("Unauthorized");
  return id;
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = getUserId(request, body);

    const {
      enrollment_id,
      entity_type,
      entity_id,
      seconds_spent = 0,
      course_id,
      last_entity_type,
      last_entity_id
    } = body;

    if (!enrollment_id || !entity_type || !entity_id) {
      return NextResponse.json({ error: "Missing identifiers" }, { status: 400 });
    }

    // 1️⃣ Update existing row WITHOUT regression
    const [upd] = await db.execute(
      `
      UPDATE progress_status
      SET
        status = CASE
          WHEN status = 'completed' THEN 'completed'
          ELSE 'in_progress'
        END,
        seconds_spent = seconds_spent + ?,
        last_seen_at = NOW()
      WHERE enrollment_id = ?
        AND entity_type = ?
        AND entity_id = ?
      `,
      [Number(seconds_spent), enrollment_id, entity_type, entity_id]
    );

    // 2️⃣ Insert only if row doesn't exist
    if (upd.affectedRows === 0) {
      await db.execute(
        `
        INSERT INTO progress_status
          (user_id, enrollment_id, entity_type, entity_id, status, pct_complete, seconds_spent, last_seen_at)
        VALUES (?, ?, ?, ?, 'in_progress', 0.0, ?, NOW())
        `,
        [userId, enrollment_id, entity_type, entity_id, Number(seconds_spent)]
      );
    }

    // 3️⃣ Update resume pointer (safe)
    if (course_id && last_entity_type && last_entity_id) {
      await db.execute(
        `
        INSERT INTO progress_pointers
          (user_id, course_id, last_entity_type, last_entity_id, last_seen_at)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          last_entity_type = VALUES(last_entity_type),
          last_entity_id = VALUES(last_entity_id),
          last_seen_at = NOW()
        `,
        [userId, Number(course_id), last_entity_type, Number(last_entity_id)]
      );
    }

    const [rows] = await db.execute(
      `SELECT * FROM progress_status WHERE enrollment_id=? AND entity_type=? AND entity_id=?`,
      [enrollment_id, entity_type, entity_id]
    );

    return NextResponse.json(rows[0], { status: 200 });
  } catch (e) {
    console.error("progress/start error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
