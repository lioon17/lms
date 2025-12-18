import { NextResponse } from "next/server";
import db from "@/lib/db";

const KINDS = new Set(["paragraph", "image", "code", "quote", "list", "callout"]);

function posInt(n) { return Number.isInteger(n) && n > 0; }

export async function POST(request) {
  try {
    const body = await request.json();
    const section_id = Number(body?.section_id);
    const position   = Number(body?.position);
    const kind       = String(body?.kind || "").toLowerCase();
    const content    = body?.content ?? null;
    const media_url  = body?.media_url ?? null;
    const language   = body?.language ?? null;

    // Validate
    if (!section_id || !posInt(section_id)) {
      return NextResponse.json({ error: "section_id must be a positive integer." }, { status: 400 });
    }
    if (!position || !posInt(position)) {
      return NextResponse.json({ error: "position must be an integer ≥ 1." }, { status: 400 });
    }
    if (!KINDS.has(kind)) {
      return NextResponse.json({ error: `kind must be one of: ${[...KINDS].join(", ")}` }, { status: 400 });
    }
    if (kind === "image" && !media_url) {
      return NextResponse.json({ error: "media_url is required when kind='image'." }, { status: 400 });
    }

    // Ensure parent section exists
    const [section] = await db.execute("SELECT id FROM lesson_sections WHERE id = ? LIMIT 1", [section_id]);
    if (!section.length) {
      return NextResponse.json({ error: "section_id does not reference an existing lesson section." }, { status: 400 });
    }

    // Insert
    const [res] = await db.execute(
      `
      INSERT INTO lesson_blocks
        (section_id, position, kind, content, media_url, language)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [section_id, position, kind, content, media_url, language]
    );

    // Return created row
    const [rows] = await db.execute(
      `SELECT id, section_id, position, kind, content, media_url, language, created_at, updated_at
       FROM lesson_blocks WHERE id = ?`,
      [res.insertId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/lesson-blocks error:", error);
    // Unique (section_id, position) → 1062
    const status = error?.errno === 1062 ? 409 : 500;
    const message = error?.errno === 1062
      ? "Position already used in this section (section_id, position must be unique)."
      : error?.sqlMessage || error?.message || "Failed to create lesson block";
    return NextResponse.json({ error: message }, { status });
  }
}
