// app/api/users/[id]/courses/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";

const STATUSES = new Set(["active", "completed", "suspended", "failed", "all"]);

/**
 * GET /api/users/:id/courses
 *   ?status=active|completed|suspended|failed|all        (default: active)
 *   ?limit=50&offset=0
 *   ?include=none|modules|modules+lessons|deep
 *      - none                → courses + enrollment metadata only
 *      - modules             → + modules
 *      - modules+lessons     → + modules + lessons
 *      - deep (default)      → + modules + lessons + lesson_sections + lesson_blocks + progress
 */
export async function GET(req, ctx) {
  try {
    // Next.js (v15+) dynamic route params must be awaited
    const params = await ctx?.params;
    const idRaw = params?.id ?? params?.userId ?? params?.userid;
    const userId = Number(idRaw);
    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid or missing user id." }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") || "active").toLowerCase();
    if (!STATUSES.has(status)) {
      return NextResponse.json(
        { error: `Invalid status. Use one of: ${[...STATUSES].join(", ")}` },
        { status: 400 }
      );
    }

    const limit = Math.max(0, Number(searchParams.get("limit") || 50));
    const offset = Math.max(0, Number(searchParams.get("offset") || 0));

    const includeRaw = (searchParams.get("include") || "deep").toLowerCase();
    const includeModules = includeRaw !== "none";
    const includeLessons = includeRaw === "modules+lessons" || includeRaw === "deep";
    const includeSections = includeRaw === "deep"; // sections + blocks + progress only in deep

    // ---------- 1) Count for pagination
    const baseWhere = ["e.user_id = ?"];
    const baseVals = [userId];
    if (status !== "all") {
      baseWhere.push("e.status = ?");
      baseVals.push(status);
    }

    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM enrollments e
       WHERE ${baseWhere.join(" AND ")}`,
      baseVals
    );
    const total = Number(countRows?.[0]?.total ?? 0);

    // ---------- 2) Page of courses via enrollments
    const pageSql = `
      SELECT
        e.id           AS enrollment_id,
        e.user_id,
        e.course_id,
        e.status       AS enrollment_status,
        e.enrolled_at,
        c.id           AS id,
        c.title,
        c.summary,
        c.cover_image_url,
        c.category_id,
        c.estimated_duration_minutes,
        c.price,
        c.currency,
        c.primary_instructor_id,
        c.is_published,
        c.pass_threshold,
        c.created_by
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE ${baseWhere.join(" AND ")}
      ORDER BY e.enrolled_at DESC, c.title ASC
      ${limit ? "LIMIT ?" : ""} ${limit && offset ? "OFFSET ?" : ""}
    `;
    const pageVals = [...baseVals];
    if (limit) pageVals.push(limit);
    if (limit && offset) pageVals.push(offset);

    const [courseRows] = await db.execute(pageSql, pageVals);

    const items = courseRows.map(r => ({
      // enrollment metadata
      enrollment_id: Number(r.enrollment_id),
      enrollment_status: r.enrollment_status,
      enrolled_at: r.enrolled_at,

      // course
      id: Number(r.id),
      title: r.title,
      summary: r.summary,
      cover_image_url: r.cover_image_url,
      category_id: r.category_id == null ? null : Number(r.category_id),
      estimated_duration_minutes:
        r.estimated_duration_minutes == null ? null : Number(r.estimated_duration_minutes),
      price: r.price == null ? 0 : Number(r.price),
      currency: (r.currency || "USD").toUpperCase(),
      primary_instructor_id:
        r.primary_instructor_id == null ? null : Number(r.primary_instructor_id),
      is_published: !!r.is_published,
      pass_threshold: r.pass_threshold == null ? null : Number(r.pass_threshold),
      created_by: r.created_by == null ? null : Number(r.created_by),

      // nested
      modules: includeModules ? [] : undefined,
    }));

    if (!includeModules || items.length === 0) {
      return NextResponse.json({ user_id: userId, status, total, items }, { status: 200 });
    }

    // ---------- 3) Fetch modules for these courses
    const courseIds = items.map(i => i.id);
    const placeholdersCourses = courseIds.map(() => "?").join(",");
    const [modRows] = await db.execute(
      `
      SELECT
        m.id, m.course_id, m.title, m.summary, m.position, m.created_at, m.updated_at
      FROM modules m
      WHERE m.course_id IN (${placeholdersCourses})
      ORDER BY m.course_id ASC, m.position ASC
      `,
      courseIds
    );

    // Group modules by course
    const modsByCourse = new Map();
    for (const m of modRows) {
      const cid = Number(m.course_id);
      if (!modsByCourse.has(cid)) modsByCourse.set(cid, []);
      modsByCourse.get(cid).push({
        id: Number(m.id),
        course_id: cid,
        title: m.title,
        summary: m.summary,
        position: Number(m.position),
        created_at: m.created_at,
        updated_at: m.updated_at,
        lessons: includeLessons ? [] : undefined,
      });
    }

    // Attach modules & collect module ids (for lessons)
    const moduleIds = [];
    for (const it of items) {
      const arr = modsByCourse.get(it.id) || [];
      it.modules = arr;
      if (includeLessons && arr.length) {
        for (const md of arr) moduleIds.push(md.id);
      }
    }

    if (!includeLessons || moduleIds.length === 0) {
      return NextResponse.json({ user_id: userId, status, total, items }, { status: 200 });
    }

    // ---------- 4) Fetch lessons for these modules
    const placeholdersModules = moduleIds.map(() => "?").join(",");
    const [lessonRows] = await db.execute(
      `
      SELECT
        l.id, l.module_id, l.title, l.summary, l.content, l.video_url,
        l.duration_seconds, l.position, l.created_at, l.updated_at
      FROM lessons l
      WHERE l.module_id IN (${placeholdersModules})
      ORDER BY l.module_id ASC, l.position ASC
      `,
      moduleIds
    );

    // Group lessons by module
    const lessonsByModule = new Map();
    for (const l of lessonRows) {
      const mid = Number(l.module_id);
      if (!lessonsByModule.has(mid)) lessonsByModule.set(mid, []);
      lessonsByModule.get(mid).push({
        id: Number(l.id),
        module_id: mid,
        title: l.title,
        summary: l.summary,
        content: l.content,
        video_url: l.video_url,
        duration_seconds: l.duration_seconds == null ? null : Number(l.duration_seconds),
        position: Number(l.position),
        created_at: l.created_at,
        updated_at: l.updated_at,
        sections: includeSections ? [] : undefined,
      });
    }

    // Attach lessons & collect lesson ids (for sections)
    const lessonIds = [];
    for (const it of items) {
      for (const md of it.modules) {
        const ls = lessonsByModule.get(md.id) || [];
        md.lessons = ls;
        if (includeSections && ls.length) {
          for (const le of ls) lessonIds.push(le.id);
        }
      }
    }

    if (!includeSections || lessonIds.length === 0) {
      return NextResponse.json({ user_id: userId, status, total, items }, { status: 200 });
    }

    // ---------- 5) Fetch lesson_sections for these lessons
    const placeholdersLessons = lessonIds.map(() => "?").join(",");
    const [sectionRows] = await db.execute(
      `
      SELECT
        s.id, s.lesson_id, s.position, s.title, s.body,
        s.est_read_seconds, s.is_checkpoint, s.created_at, s.updated_at
      FROM lesson_sections s
      WHERE s.lesson_id IN (${placeholdersLessons})
      ORDER BY s.lesson_id ASC, s.position ASC
      `,
      lessonIds
    );

    // Group sections by lesson
    const sectionsByLesson = new Map(); // lesson_id -> section[]
    const sectionIds = [];
    for (const s of sectionRows) {
      const lid = Number(s.lesson_id);
      if (!sectionsByLesson.has(lid)) sectionsByLesson.set(lid, []);
      const sec = {
        id: Number(s.id),
        lesson_id: lid,
        position: Number(s.position),
        title: s.title,
        body: s.body,
        est_read_seconds: s.est_read_seconds == null ? null : Number(s.est_read_seconds),
        is_checkpoint: !!s.is_checkpoint,
        created_at: s.created_at,
        updated_at: s.updated_at,
        blocks: [],           // will fill
        progress: null        // will fill (for this user)
      };
      sectionsByLesson.get(lid).push(sec);
      sectionIds.push(sec.id);
    }

    // Attach sections to lessons
    for (const it of items) {
      for (const md of it.modules) {
        for (const le of md.lessons) {
          le.sections = sectionsByLesson.get(le.id) || [];
        }
      }
    }

    if (sectionIds.length === 0) {
      return NextResponse.json({ user_id: userId, status, total, items }, { status: 200 });
    }

    // ---------- 6) Fetch lesson_blocks for these sections
    const placeholdersSections = sectionIds.map(() => "?").join(",");
    const [blockRows] = await db.execute(
      `
      SELECT
        b.id, b.section_id, b.position, b.kind, b.content, b.media_url, b.language,
        b.created_at, b.updated_at
      FROM lesson_blocks b
      WHERE b.section_id IN (${placeholdersSections})
      ORDER BY b.section_id ASC, b.position ASC
      `,
      sectionIds
    );

    // Group blocks by section
    const blocksBySection = new Map(); // section_id -> block[]
    for (const b of blockRows) {
      const sid = Number(b.section_id);
      if (!blocksBySection.has(sid)) blocksBySection.set(sid, []);
      blocksBySection.get(sid).push({
        id: Number(b.id),
        section_id: sid,
        position: Number(b.position),
        kind: b.kind,
        content: b.content,
        media_url: b.media_url,
        language: b.language,
        created_at: b.created_at,
        updated_at: b.updated_at,
      });
    }

    // ---------- 7) Fetch lesson_section_progress (for this user) for these sections
    const [progRows] = await db.execute(
      `
      SELECT user_id, enrollment_id, section_id, completed_at
      FROM lesson_section_progress
      WHERE user_id = ? AND section_id IN (${placeholdersSections})
      `,
      [userId, ...sectionIds]
    );
    const progressBySection = new Map(); // section_id -> progress row
    for (const p of progRows) {
      progressBySection.set(Number(p.section_id), {
        user_id: Number(p.user_id),
        enrollment_id: Number(p.enrollment_id),
        section_id: Number(p.section_id),
        completed_at: p.completed_at,
      });
    }

    // ---------- 8) Attach blocks + progress to sections
    for (const it of items) {
      for (const md of it.modules) {
        for (const le of md.lessons) {
          if (!Array.isArray(le.sections)) continue;
          for (const s of le.sections) {
            s.blocks = blocksBySection.get(s.id) || [];
            s.progress = progressBySection.get(s.id) || null;
          }
        }
      }
    }

    return NextResponse.json({ user_id: userId, status, total, items }, { status: 200 });
  } catch (error) {
    console.error("GET /api/users/[id]/courses error:", error);
    return NextResponse.json(
      { error: error?.sqlMessage || error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
