import { NextResponse } from "next/server"
import db from "@/lib/db"

 

// ✅ GET /api/quizzes?moduleId=&lessonId=&scope=&isFinal=
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get("moduleId");
    const lessonId = searchParams.get("lessonId");
    const scope = searchParams.get("scope");
    const isFinal = searchParams.get("isFinal");

    const where = [];
    const params = [];

    if (moduleId) {
      where.push("module_id = ?");
      params.push(Number(moduleId));
    }
    if (lessonId) {
      where.push("lesson_id = ?");
      params.push(Number(lessonId));
    }
    if (scope) {
      where.push("scope = ?");
      params.push(scope);
    }
    if (isFinal) {
      where.push("is_final = 1");
    }

    const [rows] = await db.execute(
      `
      SELECT
        id, module_id, scope, lesson_id, title, attempts_allowed,
        time_limit_seconds, weight, shuffle_questions, shuffle_options,
        feedback_mode, is_final, created_at, updated_at
      FROM quizzes
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY created_at DESC
      `,
      params
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}


// POST /api/quizzes
export async function POST(request) {
  try {
    const body = await request.json()

    let {
      module_id,
      lesson_id,
      scope, // optional; we'll derive if absent
      title,
      attempts_allowed = 1,
      time_limit_seconds = null,
      weight = 1,
      shuffle_questions = false,
      shuffle_options = false,
      feedback_mode = "on_finish",
      is_final = 0,
    } = body || {}

    // --- Basic validation
    if (!title || !String(title).trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Coerce IDs
    let modId = module_id != null && module_id !== "" ? Number(module_id) : null
    let lesId = lesson_id != null && lesson_id !== "" ? Number(lesson_id) : null
    let isFinal = is_final ? 1 : 0

    // Normalize by scope if provided
    if (scope === "module") { lesId = null }
    if (scope === "lesson") { modId = null }

    // XOR parent check
    if ((modId && lesId) || (!modId && !lesId)) {
      return NextResponse.json(
        { error: "Provide either module_id or lesson_id (but not both)." },
        { status: 400 }
      )
    }

    const derivedScope = scope || (lesId ? "lesson" : "module")

    // Enforce your db CHECK: module→is_final=1, lesson→is_final=0
    if (derivedScope === "module" && isFinal !== 1) {
      return NextResponse.json(
        { error: "Module quizzes must be final (is_final must be 1)." },
        { status: 400 }
      )
    }
    if (derivedScope === "lesson" && isFinal !== 0) {
      return NextResponse.json(
        { error: "Lesson quizzes cannot be final (is_final must be 0)." },
        { status: 400 }
      )
    }

    // Optional: pre-check uniqueness to return 409 instead of generic DB error
    if (derivedScope === "module") {
      const [exists] = await db.execute(
        "SELECT id FROM quizzes WHERE module_id = ? AND is_final = 1 LIMIT 1",
        [modId]
      )
      if (exists.length) {
        return NextResponse.json(
          { error: "This module already has a final quiz." },
          { status: 409 }
        )
      }
    }

    // Insert (no stray braces)
    const [result] = await db.execute(
      `
      INSERT INTO quizzes
        (module_id, scope, lesson_id, title, attempts_allowed, time_limit_seconds,
         weight, shuffle_questions, shuffle_options, feedback_mode, is_final)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        modId,
        derivedScope,
        lesId,
        String(title).trim(),
        Number(attempts_allowed || 1),
        time_limit_seconds == null || time_limit_seconds === "" ? null : Number(time_limit_seconds),
        Number(weight || 1),
        shuffle_questions ? 1 : 0,
        shuffle_options ? 1 : 0,
        feedback_mode || "on_finish",
        isFinal,
      ]
    )

    const [rows] = await db.execute(
      `
      SELECT
        id, module_id, scope, lesson_id, title, attempts_allowed,
        time_limit_seconds, weight, shuffle_questions, shuffle_options,
        feedback_mode, is_final, created_at, updated_at
      FROM quizzes
      WHERE id = ?
      `,
      [result.insertId]
    )

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error("Error creating quiz:", error)
    // 1062 is MySQL duplicate key (e.g., uniq_module_final_quiz)
    const status = error?.errno === 1062 ? 409 : 500
    return NextResponse.json(
      { error: error?.sqlMessage || error?.message || "Failed to create quiz" },
      { status }
    )
  }
}
