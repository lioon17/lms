import { NextResponse } from "next/server";
import db from "@/lib/db";

/**
 * GET /api/progress/summary?enrollmentId=123&courseId=1
 * Returns overall course progress metrics
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get("enrollmentId");
    const courseId = searchParams.get("courseId");

    if (!enrollmentId) {
      return NextResponse.json({ error: "enrollmentId required" }, { status: 400 });
    }

    // Pull all progress rows for this enrollment
    const [rows] = await db.execute(
      `SELECT entity_type, status, pct_complete
         FROM progress_status
        WHERE enrollment_id = ?`,
      [enrollmentId]
    );

    if (!rows.length) {
      return NextResponse.json({
        courseProgress: 0,
        lessonsCompleted: 0,
        totalLessons: 0,
        quizzesPassed: 0,
        totalQuizzes: 0,
      });
    }

    const totalLessons = rows.filter(r => r.entity_type === "lesson").length;
    const lessonsCompleted = rows.filter(
      r => r.entity_type === "lesson" && r.status === "completed"
    ).length;

    const totalQuizzes = rows.filter(r => r.entity_type === "quiz").length;
    const quizzesPassed = rows.filter(
      r => r.entity_type === "quiz" && r.status === "passed"
    ).length;

    const pctLessons = totalLessons > 0 ? lessonsCompleted / totalLessons : 0;
    const pctQuizzes = totalQuizzes > 0 ? quizzesPassed / totalQuizzes : 0;

    const courseProgress = Math.round(((pctLessons + pctQuizzes) / 2) * 100);

    return NextResponse.json({
      courseProgress,
      lessonsCompleted,
      totalLessons,
      quizzesPassed,
      totalQuizzes,
    });
  } catch (e) {
    console.error("progress/summary error:", e);
    return NextResponse.json({ error: "Failed to compute summary" }, { status: 500 });
  }
}
