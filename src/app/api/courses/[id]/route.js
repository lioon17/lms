// src/app/api/courses/[id]/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/jwt";
import { findCourseById, updateCourseById } from "@/lib/queries/courses";
import db from "@/lib/db";

function isUrl(s) {
  if (s == null || s === "") return true;
  try { new URL(s); return true; } catch { return false; }
}
function is3Upper(s) { return typeof s === "string" && /^[A-Z]{3}$/.test(s); }

export async function PATCH(req, ctx) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.COOKIE_NAME || "session")?.value;
    const session = token ? verifySession(token) : null;
    if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: idParam } = await ctx.params; // await dynamic params
    const id = Number(idParam);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const existing = await findCourseById(id);
    if (!existing) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const body = await req.json();
    const fields = {};

  

    if (body.title !== undefined) {
      const t = String(body.title).trim();
      if (!t) return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
      fields.title = t;
    }

    if (body.summary !== undefined) {
      fields.summary = body.summary ?? null;
    }

    if (body.cover_image_url !== undefined) {
      const u = body.cover_image_url ?? null;
      if (!isUrl(u)) return NextResponse.json({ error: "cover_image_url must be a valid URL" }, { status: 400 });
      fields.cover_image_url = u;
    }

    if (body.category_id !== undefined) {
      const cid = body.category_id == null ? null : Number(body.category_id);
      if (cid != null && Number.isNaN(cid)) {
        return NextResponse.json({ error: "category_id must be a number or null" }, { status: 400 });
      }
      fields.category_id = cid;
    }

    if (body.estimated_duration_minutes !== undefined) {
      const dur = body.estimated_duration_minutes == null ? null : Number(body.estimated_duration_minutes);
      if (dur != null && (!Number.isInteger(dur) || dur < 0)) {
        return NextResponse.json({ error: "estimated_duration_minutes must be a non-negative integer or null" }, { status: 400 });
      }
      fields.estimated_duration_minutes = dur;
    }

    if (body.price !== undefined) {
      const p = Number(body.price);
      if (Number.isNaN(p) || p < 0) {
        return NextResponse.json({ error: "price must be a non-negative number" }, { status: 400 });
      }
      fields.price = p;
    }

    if (body.currency !== undefined) {
      const c = String(body.currency).toUpperCase();
      if (!is3Upper(c)) {
        return NextResponse.json({ error: "currency must be a 3-letter uppercase code" }, { status: 400 });
      }
      fields.currency = c;
    }

    if (body.primary_instructor_id !== undefined) {
      const pid = body.primary_instructor_id == null ? null : Number(body.primary_instructor_id);
      if (pid != null && Number.isNaN(pid)) {
        return NextResponse.json({ error: "primary_instructor_id must be a number or null" }, { status: 400 });
      }
      fields.primary_instructor_id = pid;
    }

    if (body.is_published !== undefined) {
      fields.is_published = !!body.is_published;
    }

    if (body.pass_threshold !== undefined) {
      const pt = Number(body.pass_threshold);
      if (Number.isNaN(pt) || pt < 0 || pt > 100) {
        return NextResponse.json({ error: "pass_threshold must be between 0 and 100" }, { status: 400 });
      }
      fields.pass_threshold = pt;
    }

    const { changed } = await updateCourseById(id, fields);
    return NextResponse.json({ message: "Course updated", changed }, { status: 200 });
  } catch (err) {
    console.error("update course error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



export async function DELETE(_req, ctx) {
  try {
    const { id: idParam } = await ctx.params;
    const id = Number(idParam);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const [res] = await db.execute(`DELETE FROM courses WHERE id = ?`, [id]);
    return NextResponse.json({ deleted: res.affectedRows }, { status: 200 });
  } catch (e) {
    console.error("delete course error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(_req, ctx) {
  try {
    const { id: idParam } = await ctx.params
    const id = Number(idParam)
    if (!id) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const [rows] = await db.execute(
      `SELECT
         c.id,
         c.title,
         c.summary,
         c.cover_image_url,
         c.category_id,
         cat.name AS category_name,
         c.estimated_duration_minutes,
         c.price,
         c.currency,
         c.primary_instructor_id,
         c.is_published,
         c.pass_threshold,
         c.created_by,
         u.name  AS creator_name,
         u.email AS creator_email
       FROM courses c
       LEFT JOIN users u  ON c.created_by = u.id
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE c.id = ?
       LIMIT 1`,
      [id]
    )

    if (!rows.length) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const row = rows[0]
    // optional: normalize booleans/numbers if you prefer
    // row.is_published = row.is_published === 1

    return NextResponse.json(row, { status: 200 })
  } catch (err) {
    console.error("get course by id error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}