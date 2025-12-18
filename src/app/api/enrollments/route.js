import { NextResponse } from "next/server";
import db from "@/lib/db";

// Allowed statuses from your ENUM
const ALLOWED = new Set(["active", "completed", "suspended", "failed"]);

// POST /api/enrollments
// Body: { user_id, course_id, status? = 'active', parent_enrollment_id? }
export async function POST(request) {
  try {
    const body = await request.json();
    let {
      user_id,
      course_id,
      status = "active",
      parent_enrollment_id = null,
    } = body || {};

    // --- Basic validation
    const uid = user_id != null && user_id !== "" ? Number(user_id) : null;
    const cid = course_id != null && course_id !== "" ? Number(course_id) : null;
    const pid =
      parent_enrollment_id != null && parent_enrollment_id !== ""
        ? Number(parent_enrollment_id)
        : null;

    if (!uid || !cid) {
      return NextResponse.json(
        { error: "user_id and course_id are required." },
        { status: 400 }
      );
    }

    if (!ALLOWED.has(String(status))) {
      return NextResponse.json(
        { error: `Invalid status. Use one of: ${[...ALLOWED].join(", ")}` },
        { status: 400 }
      );
    }

    // Optional: Verify parent enrollment exists (if provided)
    if (pid) {
      const [parentRows] = await db.execute(
        "SELECT id FROM enrollments WHERE id = ? LIMIT 1",
        [pid]
      );
      if (!parentRows.length) {
        return NextResponse.json(
          { error: "parent_enrollment_id does not reference an existing enrollment." },
          { status: 400 }
        );
      }
    }

    // Insert
    const [result] = await db.execute(
      `
      INSERT INTO enrollments
        (user_id, course_id, status, parent_enrollment_id)
      VALUES (?, ?, ?, ?)
      `,
      [uid, cid, status, pid]
    );

    // Return created row
    const [rows] = await db.execute(
      `
      SELECT id, user_id, course_id, status, enrolled_at, parent_enrollment_id
      FROM enrollments
      WHERE id = ?
      `,
      [result.insertId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    // 1062 = MySQL duplicate key (uniq_user_course)
    const status = error?.errno === 1062 ? 409 : 500;
    const message =
      error?.errno === 1062
        ? "This user is already enrolled in the course."
        : error?.sqlMessage || error?.message || "Failed to create enrollment";
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH /api/enrollments
// Body: { id OR (user_id & course_id), status }
// Updates only the status field and returns the updated row.
export async function PATCH(request) {
  try {
    const body = await request.json();
    let { id, user_id, course_id, status } = body || {};

    if (!status || !ALLOWED.has(String(status))) {
      return NextResponse.json(
        { error: `Valid status is required: ${[...ALLOWED].join(", ")}` },
        { status: 400 }
      );
    }

    // Identify target enrollment either by id OR by (user_id, course_id)
    let targetId = id != null && id !== "" ? Number(id) : null;

    if (!targetId) {
      const uid = user_id != null && user_id !== "" ? Number(user_id) : null;
      const cid = course_id != null && course_id !== "" ? Number(course_id) : null;

      if (!uid || !cid) {
        return NextResponse.json(
          { error: "Provide enrollment id OR both user_id and course_id." },
          { status: 400 }
        );
      }

      const [found] = await db.execute(
        "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ? LIMIT 1",
        [uid, cid]
      );
      if (!found.length) {
        return NextResponse.json(
          { error: "Enrollment not found for given user_id and course_id." },
          { status: 404 }
        );
      }
      targetId = Number(found[0].id);
    }

    // Update status
    const [res] = await db.execute(
      "UPDATE enrollments SET status = ? WHERE id = ?",
      [status, targetId]
    );

    if (res.affectedRows === 0) {
      return NextResponse.json({ error: "Enrollment not found." }, { status: 404 });
    }

    // Return updated row
    const [rows] = await db.execute(
      `
      SELECT id, user_id, course_id, status, enrolled_at, parent_enrollment_id
      FROM enrollments
      WHERE id = ?
      `,
      [targetId]
    );

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return NextResponse.json(
      { error: error?.sqlMessage || error?.message || "Failed to update enrollment" },
      { status: 500 }
    );
  }
}
