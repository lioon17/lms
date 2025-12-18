import { NextResponse } from "next/server";
import db from "@/lib/db";

// POST /api/quizzes/attempts/[id]/submit
// body: { answers: { [questionId]: number | number[] | string } }
export async function POST(request, contextPromise) {
  const { params } = await contextPromise;
  try {
    const attemptId = Number(params.id);
    if (!attemptId) return NextResponse.json({ error: "Missing attempt id" }, { status: 400 });

    const { answers = {} } = await request.json().catch(() => ({}));

    // 1) Attempt & quiz
    const [arows] = await db.execute(
      `SELECT a.id, a.quiz_id, a.completed_at, q.time_limit_seconds
         FROM quiz_attempts a
         JOIN quizzes q ON q.id = a.quiz_id
        WHERE a.id = ?`,
      [attemptId]
    );
    if (!arows.length) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    if (arows[0].completed_at) {
      return NextResponse.json({ error: "Attempt already submitted" }, { status: 400 });
    }
    const quizId = arows[0].quiz_id;

    // 2) Questions (point weights)
    const [qs] = await db.execute(
      `SELECT id, question_type, points FROM quiz_questions WHERE quiz_id=? ORDER BY position ASC`,
      [quizId]
    );
    if (!qs.length) {
      // edge case: empty quiz → score 0, complete attempt
      await db.execute(`UPDATE quiz_attempts SET completed_at=CURRENT_TIMESTAMP, score=0 WHERE id=?`, [attemptId]);
      return NextResponse.json({ score: 0, passed: false, earned: 0, total: 0, details: [] });
    }

    // 3) Correct answers (keys)
    const qids = qs.map(q => q.id);
    const [krows] = await db.query(
      `SELECT question_id, id AS answer_id, answer_text
         FROM quiz_answers
        WHERE is_correct=1 AND question_id IN (${qids.map(() => "?").join(",")})`,
      qids
    );

    const correctByQ = {};
    for (const r of krows) {
      const arr = correctByQ[r.question_id] || (correctByQ[r.question_id] = []);
      arr.push({ id: Number(r.answer_id), text: r.answer_text });
    }

    // 4) Grade
    let earned = 0;
    let total = 0;
    const details = [];

    for (const q of qs) {
      const qid = q.id;
      const pts = Number(q.points);
      total += pts;

      const type = q.question_type; // "multiple_choice" | "true_false" | "short_answer" | "fill_blank"
      const user = answers[qid];
      const correct = (correctByQ[qid] || []).map(c => ({ id: c.id, text: c.text }));

      let ok = false;
      if (type === "multiple_choice" || type === "true_false") {
        // accept single id or array (some MCQs have multiple correct)
        const yourIds = Array.isArray(user) ? user.map(Number).sort() : [Number(user)].filter(Boolean);
        const correctIds = correct.map(c => c.id).sort();
        ok = yourIds.length === correctIds.length && yourIds.every((v, i) => v === correctIds[i]);
      } else {
        // text-ish: normalize against first correct text (you can extend to regex)
        const norm = (s) => String(s ?? "").trim().toLowerCase();
        ok = norm(user) === norm(correct[0]?.text || "");
      }

      if (ok) earned += pts;

      details.push({
        question_id: qid,
        your: user ?? null,
        correct,
        points: pts,
        awarded: ok ? pts : 0,
        result: ok ? "correct" : "incorrect",
      });
    }

    const scorePct = total > 0 ? Number(((earned / total) * 100).toFixed(2)) : 0;

    // 5) Persist attempt
    await db.execute(
      `UPDATE quiz_attempts SET completed_at=CURRENT_TIMESTAMP, score=? WHERE id=?`,
      [scorePct, attemptId]
    );

    return NextResponse.json({
      score: scorePct,
      passed: scorePct >= 70,
      earned,
      total,
      details
    });
  } catch (e) {
    console.error("submit error:", e);
    return NextResponse.json({ error: "Failed to submit attempt" }, { status: 500 });
  }
}
