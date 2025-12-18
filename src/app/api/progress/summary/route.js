import { NextResponse } from "next/server";
import db from "@/lib/db";

/**
 * GET /api/progress/summary?enrollmentId=123
 * Course-based progress summary computed from:
 * - curriculum tables for totals
 * - progress_status for lesson completion
 * - quiz_attempts for quiz attempts + pass status
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const enrollmentIdRaw = searchParams.get("enrollmentId");

    if (!enrollmentIdRaw) {
      return NextResponse.json({ error: "enrollmentId required" }, { status: 400 });
    }

    const enrollmentId = Number(enrollmentIdRaw);
    if (!Number.isFinite(enrollmentId)) {
      return NextResponse.json({ error: "Invalid enrollmentId" }, { status: 400 });
    }

    // 1) Resolve enrollment -> user + course
    const [enrollRows] = await db.execute(
      `SELECT id, user_id, course_id
         FROM enrollments
        WHERE id = ?
        LIMIT 1`,
      [enrollmentId]
    );

    if (!enrollRows.length) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    const { user_id: userId, course_id: courseId } = enrollRows[0];

    // 2) Totals from curriculum
    const [[lessonTotalRow]] = await db.execute(
      `
      SELECT COUNT(*) AS totalLessons
      FROM lessons l
      JOIN modules m ON m.id = l.module_id
      WHERE m.course_id = ?
      `,
      [courseId]
    );

    const [[moduleQuizTotalRow]] = await db.execute(
      `
      SELECT COUNT(*) AS totalModuleQuizzes
      FROM quizzes q
      JOIN modules m ON m.id = q.module_id
      WHERE q.scope = 'module'
        AND m.course_id = ?
      `,
      [courseId]
    );

    const [[lessonQuizTotalRow]] = await db.execute(
      `
      SELECT COUNT(*) AS totalLessonQuizzes
      FROM quizzes q
      JOIN lessons l ON l.id = q.lesson_id
      JOIN modules m ON m.id = l.module_id
      WHERE q.scope = 'lesson'
        AND m.course_id = ?
      `,
      [courseId]
    );

    const totalLessons = Number(lessonTotalRow?.totalLessons || 0);
    const totalQuizzes =
      Number(moduleQuizTotalRow?.totalModuleQuizzes || 0) +
      Number(lessonQuizTotalRow?.totalLessonQuizzes || 0);

    // 3) Completed lessons *in this course only* (status-based)
    const [[lessonsCompletedRow]] = await db.execute(
      `
      SELECT COUNT(DISTINCT ps.entity_id) AS lessonsCompleted
      FROM progress_status ps
      JOIN lessons l ON l.id = ps.entity_id
      JOIN modules m ON m.id = l.module_id
      WHERE ps.enrollment_id = ?
        AND ps.user_id = ?
        AND ps.entity_type = 'lesson'
        AND m.course_id = ?
        AND ps.status = 'completed'
      `,
      [enrollmentId, userId, courseId]
    );
    const lessonsCompleted = Number(lessonsCompletedRow?.lessonsCompleted || 0);

    // 4) Quiz attempts + passes *in this course only*
    // We map each attempt to a course via the quiz scope:
    // - module quiz: quizzes.module_id -> modules.course_id
    // - lesson quiz: quizzes.lesson_id -> lessons.module_id -> modules.course_id
    const [[quizAggRow]] = await db.execute(
      `
      SELECT
        COUNT(*) AS totalAttemptsUsed,
        COUNT(DISTINCT qa.quiz_id) AS quizzesAttempted,
        COUNT(DISTINCT CASE WHEN qa.completed_at IS NOT NULL AND qa.passed = 1 THEN qa.quiz_id END) AS quizzesPassed,
        MAX(qa.started_at) AS lastQuizAttemptAt
      FROM quiz_attempts qa
      JOIN quizzes q ON q.id = qa.quiz_id

      LEFT JOIN modules m_mod
        ON (q.scope = 'module' AND m_mod.id = q.module_id)

      LEFT JOIN lessons l
        ON (q.scope = 'lesson' AND l.id = q.lesson_id)

      LEFT JOIN modules m_les
        ON (q.scope = 'lesson' AND m_les.id = l.module_id)

      WHERE qa.enrollment_id = ?
        AND qa.user_id = ?
        AND COALESCE(m_mod.course_id, m_les.course_id) = ?
      `,
      [enrollmentId, userId, courseId]
    );

    const totalAttemptsUsed = Number(quizAggRow?.totalAttemptsUsed || 0);
    const quizzesAttempted = Number(quizAggRow?.quizzesAttempted || 0);
    const quizzesPassed = Number(quizAggRow?.quizzesPassed || 0);
    const lastQuizAttemptAt = quizAggRow?.lastQuizAttemptAt || null;

    // 5) Time + last activity (from progress_status)
    const [[activityRow]] = await db.execute(
      `
      SELECT
        SUM(seconds_spent) AS totalSecondsSpent,
        MAX(last_seen_at) AS lastSeenAt
      FROM progress_status
      WHERE enrollment_id = ?
        AND user_id = ?
      `,
      [enrollmentId, userId]
    );

    const totalSecondsSpent = Number(activityRow?.totalSecondsSpent || 0);
    const lastSeenAt = activityRow?.lastSeenAt || null;

    // 6) Course progress % (items-completed model)
    const denom = totalLessons + totalQuizzes;
    const courseProgress =
      denom > 0 ? Math.round(((lessonsCompleted + quizzesPassed) / denom) * 100) : 0;

    return NextResponse.json({
      enrollmentId,
      userId,
      courseId,

      courseProgress,

      lessonsCompleted,
      totalLessons,

      quizzesPassed,      // now from quiz_attempts
      quizzesAttempted,   // new
      totalQuizzes,

      totalAttemptsUsed,  // new
      lastQuizAttemptAt,  // new

      totalSecondsSpent,
      lastSeenAt,
    });
  } catch (e) {
    console.error("progress/summary error:", e);
    return NextResponse.json({ error: "Failed to compute summary" }, { status: 500 });
  }
}
