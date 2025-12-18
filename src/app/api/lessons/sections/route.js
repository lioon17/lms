// app/api/lesson-sections/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";

// POST /api/lesson-sections
// Body: { lesson_id, position, title, body?, est_read_seconds?, is_checkpoint? }
export async function POST(request) {
  try {
    const body = await request.json();
    let {
      lesson_id,
      position,
      title,
      body: content = null,
      est_read_seconds = null,
      is_checkpoint = 0,
    } = body || {};

    // ---- Basic validation
    const lessonId = lesson_id != null && lesson_id !== "" ? Number(lesson_id) : null;
    const pos = position != null && position !== "" ? Number(position) : null;
    const ttl = typeof title === "string" ? title.trim() : "";
    const readSecs =
      est_read_seconds == null || est_read_seconds === ""
        ? null
        : Number(est_read_seconds);
    const checkpoint = !!is_checkpoint; // normalize to boolean

    if (!lessonId || !Number.isInteger(lessonId) || lessonId < 1) {
      return NextResponse.json({ error: "lesson_id must be a positive integer." }, { status: 400 });
    }
    if (!pos || !Number.isInteger(pos) || pos < 1) {
      return NextResponse.json({ error: "position must be an integer >= 1." }, { status: 400 });
    }
    if (!ttl) {
      return NextResponse.json({ error: "title is required." }, { status: 400 });
    }
    if (ttl.length > 200) {
      return NextResponse.json({ error: "title must be ≤ 200 characters." }, { status: 400 });
    }
    if (readSecs != null && (!Number.isInteger(readSecs) || readSecs < 0)) {
      return NextResponse.json({ error: "est_read_seconds must be a non-negative integer or null." }, { status: 400 });
    }

    // ---- Optional: ensure the parent lesson exists
    const [lessonRows] = await db.execute(
      "SELECT id FROM lessons WHERE id = ? LIMIT 1",
      [lessonId]
    );
    if (!lessonRows.length) {
      return NextResponse.json({ error: "lesson_id does not reference an existing lesson." }, { status: 400 });
    }

    // ---- Insert
    const [result] = await db.execute(
      `
      INSERT INTO lesson_sections
        (lesson_id, position, title, body, est_read_seconds, is_checkpoint)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [lessonId, pos, ttl, content, readSecs, checkpoint ? 1 : 0]
    );

    // ---- Return created row
    const [rows] = await db.execute(
      `
      SELECT
        id, lesson_id, position, title, body, est_read_seconds, is_checkpoint,
        created_at, updated_at
      FROM lesson_sections
      WHERE id = ?
      `,
      [result.insertId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating lesson section:", error);
    // MySQL duplicate key (unique (lesson_id, position)) → 1062
    const status = error?.errno === 1062 ? 409 : 500;
    const message =
      error?.errno === 1062
        ? "Position already used for this lesson (lesson_id, position must be unique)."
        : error?.sqlMessage || error?.message || "Failed to create lesson section";
    return NextResponse.json({ error: message }, { status });
  }
}
