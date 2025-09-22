// src/app/api/courses/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/jwt";
import { createCourse } from "@/lib/queries/courses";
import db from "@/lib/db"  


function isUrl(s) {
  if (s == null || s === "") return true; // allow null/empty
  try { new URL(s); return true; } catch { return false; }
}
function is3Upper(s) { return typeof s === "string" && /^[A-Z]{3}$/.test(s); }

export async function POST(req) {
  try {
    // auth (creator)
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.COOKIE_NAME || "session")?.value;
    const session = token ? verifySession(token) : null;
    if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

     
    const title = String(body?.title || "").trim();
    const summary = body?.summary ?? null;
    const cover_image_url = body?.cover_image_url ?? null;

    const category_id = body?.category_id == null ? null : Number(body.category_id);
    const estimated_duration_minutes = body?.estimated_duration_minutes == null
      ? null
      : Number(body.estimated_duration_minutes);

    const price = body?.price == null ? 0.0 : Number(body.price);
    const currency = (body?.currency || "USD").toUpperCase();

    const primary_instructor_id = body?.primary_instructor_id == null
      ? null
      : Number(body.primary_instructor_id);

    const is_published = !!body?.is_published;
    const pass_threshold = body?.pass_threshold == null ? 70.0 : Number(body.pass_threshold);

     
    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }
    if (!isUrl(cover_image_url)) {
      return NextResponse.json({ error: "cover_image_url must be a valid URL" }, { status: 400 });
    }
    if (estimated_duration_minutes != null && (!Number.isInteger(estimated_duration_minutes) || estimated_duration_minutes < 0)) {
      return NextResponse.json({ error: "estimated_duration_minutes must be a non-negative integer or null" }, { status: 400 });
    }
    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: "price must be a non-negative number" }, { status: 400 });
    }
    if (!is3Upper(currency)) {
      return NextResponse.json({ error: "currency must be a 3-letter uppercase code (e.g., USD, EUR)" }, { status: 400 });
    }
    if (Number.isNaN(pass_threshold) || pass_threshold < 0 || pass_threshold > 100) {
      return NextResponse.json({ error: "pass_threshold must be between 0 and 100" }, { status: 400 });
    }
    if (category_id != null && Number.isNaN(category_id)) {
      return NextResponse.json({ error: "category_id must be a number or null" }, { status: 400 });
    }
    if (primary_instructor_id != null && Number.isNaN(primary_instructor_id)) {
      return NextResponse.json({ error: "primary_instructor_id must be a number or null" }, { status: 400 });
    }

  
    const id = await createCourse({
      title,
      summary,
      cover_image_url,
      category_id,
      estimated_duration_minutes,
      price,
      currency,
      primary_instructor_id,
      is_published,
      pass_threshold,
      created_by: session.id,
    });

    return NextResponse.json(
      {
        message: "Course created",
        id,
        title,
        summary,
        cover_image_url,
        category_id,
        estimated_duration_minutes,
        price,
        currency,
        primary_instructor_id,
        is_published,
        pass_threshold,
        created_by: session.id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("create course error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



export async function GET() {
  try {
    // --- KPIs: counts ---
    const [countRows] = await db.execute(`
      SELECT
        COUNT(*)                                                   AS total_courses,
        SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END)          AS published_courses,
        SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END)          AS draft_courses
      FROM courses
    `)

   
    // existing detailed list
    const courses = await listAllCourses()

    // shape the response
    const counts = countRows?.[0] || {}
    const kpis = {
      total_courses: Number(counts.total_courses || 0),
      published_courses: Number(counts.published_courses || 0),
      draft_courses: Number(counts.draft_courses || 0),
    }

    return NextResponse.json({ kpis, data: courses }, { status: 200 })
  } catch (err) {
    console.error("list courses error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// unchanged; keep your original function
export async function listAllCourses() {
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
     ORDER BY c.id DESC`
  );
  return rows;
}
