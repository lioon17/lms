// src/app/api/modules/[id]/quizzes/route.js

import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  const id = request.nextUrl.pathname.split("/").at(-2); // /api/modules/3/quizzes → "3"

  if (!id || isNaN(id)) {
    return NextResponse.json({ message: 'Invalid module ID' }, { status: 400 });
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT 
        m.id,
        m.course_id,
        m.title,
        m.summary,
        m.position,
        m.created_at,
        m.updated_at,
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
      FROM modules m
      LEFT JOIN quizzes q 
        ON q.module_id = m.id AND q.scope = 'module'
      WHERE m.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Module not found' }, { status: 404 });
    }

    const {
      id: moduleId,
      course_id,
      title,
      summary,
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

    const moduleData = {
      id: moduleId,
      course_id,
      title,
      summary,
      position,
      created_at,
      updated_at,
      quizzes
    };

    return NextResponse.json(moduleData);
  } catch (error) {
    console.error('Database error:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
