import { NextResponse } from "next/server";
import db from "@/lib/db";

function posInt(n) { return Number.isInteger(n) && n > 0; }

export async function POST(request) {
  try {
    const body = await request.json();
    const user_id       = Number(body?.user_id);
    const enrollment_id = body?.enrollment_id ? Number(body.enrollment_id) : null;
    const section_id    = Number(body?.section_id);

    if (!user_id || !posInt(user_id)) {
      return NextResponse.json({ error: "user_id must be a positive integer." }, { status: 400 });
    }
    if (!section_id || !posInt(section_id)) {
      return NextResponse.json({ error: "section_id must be a positive integer." }, { status: 400 });
    }
    if (enrollment_id != null && !posInt(enrollment_id)) {
      return NextResponse.json({ error: "enrollment_id must be a positive integer or null." }, { status: 400 });
    }

    // Ensure the section exists
    const [section] = await db.execute("SELECT id FROM lesson_sections WHERE id = ? LIMIT 1", [section_id]);
    if (!section.length) {
      return NextResponse.json({ error: "section_id does not reference an existing lesson section." }, { status: 400 });
    }

    // Optional: you can verify enrollment/user relationships here if you enforce it in your app.

    // Idempotent upsert: insert or refresh completed_at
    await db.execute(
      `
      INSERT INTO lesson_section_progress (user_id, enrollment_id, section_id)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        enrollment_id = VALUES(enrollment_id),
        completed_at = CURRENT_TIMESTAMP
      `,
      [user_id, enrollment_id, section_id]
    );

    // Return the current row
    const [rows] = await db.execute(
      `SELECT user_id, enrollment_id, section_id, completed_at
       FROM lesson_section_progress
       WHERE user_id = ? AND section_id = ?`,
      [user_id, section_id]
    );

    // If INSERT failed silently (edge), fail gracefully
    if (!rows.length) {
      return NextResponse.json({ error: "Failed to record progress." }, { status: 500 });
    }

    // 201 for first-time, 200 for updates is nice—but MySQL upsert doesn't tell easily.
    // We'll just return 200 unless you want to add a pre-check.
    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("POST /api/lesson-section-progress error:", error);
    return NextResponse.json(
      { error: error?.sqlMessage || error?.message || "Failed to record section progress" },
      { status: 500 }
    );
  }
}
