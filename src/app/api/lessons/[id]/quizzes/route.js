import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  const id = request.nextUrl.pathname.split("/").at(-2); // /api/lessons/5/quizzes → "5"

  if (!id || isNaN(id)) {
    return NextResponse.json({ message: "Invalid lesson ID" }, { status: 400 });
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT 
        l.id,
        l.module_id,
        l.title,
        l.summary,
        l.content,
        l.video_url,
        l.duration_seconds,
        l.position,
        l.created_at,
        l.updated_at,
        q.id AS quiz_id,
        q.title AS quiz_title,
        q.scope,
        q.attempts_allowed,
        q.time_limit_seconds,
        q.weight,
        q.shuffle_questions,
        q.shuffle_options,
        q.feedback_mode,
        q.is_final,
        q.created_at AS quiz_created_at,
        q.updated_at AS quiz_updated_at
      FROM lessons l
      LEFT JOIN quizzes q 
        ON q.lesson_id = l.id AND q.scope = 'lesson'
      WHERE l.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Lesson not found" }, { status: 404 });
    }

    const {
      id: lessonId,
      module_id,
      title,
      summary,
      content,
      video_url,
      duration_seconds,
      position,
      created_at,
      updated_at,
    } = rows[0];

    const quizzes = rows
      .filter(row => row.quiz_id !== null)
      .map(row => ({
        quiz_id: row.quiz_id,
        quiz_title: row.quiz_title,
        scope: row.scope,
        attempts_allowed: row.attempts_allowed,
        time_limit_seconds: row.time_limit_seconds,
        weight: row.weight,
        shuffle_questions: row.shuffle_questions,
        shuffle_options: row.shuffle_options,
        feedback_mode: row.feedback_mode,
        is_final: row.is_final,
        quiz_created_at: row.quiz_created_at,
        quiz_updated_at: row.quiz_updated_at
      }));

    const lessonData = {
      id: lessonId,
      module_id,
      title,
      summary,
      content,
      video_url,
      duration_seconds,
      position,
      created_at,
      updated_at,
      quizzes
    };

    return NextResponse.json(lessonData);
  } catch (error) {
    console.error("Database error:", error.message);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
