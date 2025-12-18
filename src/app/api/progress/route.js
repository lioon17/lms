import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get("enrollmentId");
    const entityType = searchParams.get("entityType"); // optional
    const entityId = searchParams.get("entityId");     // optional

    const where = [];
    const args = [];
    if (enrollmentId) { where.push("enrollment_id=?"); args.push(Number(enrollmentId)); }
    if (entityType)   { where.push("entity_type=?");   args.push(entityType); }
    if (entityId)     { where.push("entity_id=?");     args.push(Number(entityId)); }

    const sql = `
      SELECT * FROM progress_status
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY updated_at DESC
      LIMIT 500
    `;
    const [rows] = await db.execute(sql, args);
    return NextResponse.json(rows);
  } catch (e) {
    console.error("progress GET error:", e);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

// Admin-only purge (toggle guard as needed)
export async function DELETE(request) {
  try {
    // TODO: authz check
    const body = await request.json().catch(() => ({}));
    const { enrollment_id, entity_type, entity_id } = body || {};
    if (!enrollment_id || !entity_type || !entity_id) {
      return NextResponse.json({ error: "enrollment_id, entity_type, entity_id required" }, { status: 400 });
    }
    const [res] = await db.execute(
      `DELETE FROM progress_status WHERE enrollment_id=? AND entity_type=? AND entity_id=?`,
      [enrollment_id, entity_type, entity_id]
    );
    return NextResponse.json({ deleted: res.affectedRows });
  } catch (e) {
    console.error("progress DELETE error:", e);
    return NextResponse.json({ error: "Failed to delete progress" }, { status: 500 });
  }
}
