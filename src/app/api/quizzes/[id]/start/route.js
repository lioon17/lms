// app/api/quizzes/[id]/start/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";

// Simple demo auth: read user id from header; fallback to 1
async function requireUserId(request) {
  const hdr = request.headers.get("x-user-id");
  return hdr ? Number(hdr) : 1;
}

export async function POST(request, ctx) {
  try {
    // ✅ await params
    const { id } = await ctx.params;
    const quizId = Number(id);
    const userId = await requireUserId(request);

    // 1) Quiz meta
    const [qrows] = await db.execute(
      `SELECT id, attempts_allowed, time_limit_seconds, shuffle_questions, shuffle_options
       FROM quizzes WHERE id = ?`,
      [quizId]
    );
    if (!qrows.length) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    const quiz = qrows[0];

    // 2) Ensure user exists (FK safety)
    const [urows] = await db.execute(`SELECT id FROM users WHERE id = ?`, [userId]);
    if (!urows.length) {
      return NextResponse.json(
        { error: `User ${userId} not found (FK constraint)` },
        { status: 400 }
      );
    }

    // 3) Enforce attempts cap
    const [arows] = await db.execute(
      `SELECT COUNT(*) AS c FROM quiz_attempts WHERE quiz_id = ? AND user_id = ?`,
      [quizId, userId]
    );
    const used = Number(arows[0].c || 0);
    if (used >= Number(quiz.attempts_allowed)) {
      return NextResponse.json({ error: "No attempts remaining" }, { status: 403 });
    }

    // 4) Create attempt
    const attempt_number = used + 1;
    const [ins] = await db.execute(
      `INSERT INTO quiz_attempts (quiz_id, user_id, attempt_number)
       VALUES (?, ?, ?)`,
      [quizId, userId, attempt_number]
    );
    const attemptId = ins.insertId;

    // 5) Prepare timing
    const ttl = quiz.time_limit_seconds ?? 600;
    const expiresAt = new Date(Date.now() + ttl * 1000);

    // 6) Fetch questions (shuffle if needed)
    const orderBy = quiz.shuffle_questions ? "ORDER BY RAND()" : "ORDER BY q.position ASC";
    const [questions] = await db.execute(
      `
      SELECT q.id, q.question_text, q.question_type, q.points, q.position
      FROM quiz_questions q
      WHERE q.quiz_id = ?
      ${orderBy}
      `,
      [quizId]
    );

    // 7) Fetch options (shuffle if needed)
    const qids = questions.map((r) => r.id);
    const answersByQ = {};
    if (qids.length) {
      const ansOrder = quiz.shuffle_options ? "ORDER BY RAND()" : "ORDER BY a.id ASC";
      const placeholders = qids.map(() => "?").join(",");
      const [answers] = await db.query(
        `
        SELECT a.id, a.question_id, a.answer_text
        FROM quiz_answers a
        WHERE a.question_id IN (${placeholders})
        ${ansOrder}
        `,
        qids
      );
      for (const a of answers) {
        if (!answersByQ[a.question_id]) answersByQ[a.question_id] = [];
        answersByQ[a.question_id].push({ id: a.id, text: a.answer_text });
      }
    }

    // 8) Payload (no correctness flags!)
    const payload = questions.map((q) => ({
      id: q.id,
      type: q.question_type,       // "multiple_choice" | "true_false" | "short_answer" | "fill_blank"
      question: q.question_text,
      points: Number(q.points),
      options: answersByQ[q.id] || []
    }));

    return NextResponse.json(
      {
        attempt_id: attemptId,
        attempt_number,
        time_limit_seconds: ttl,
        expires_at: expiresAt.toISOString(),
        questions: payload
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("start quiz error:", e);
    return NextResponse.json({ error: "Failed to start quiz" }, { status: 500 });
  }
}
