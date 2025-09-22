// src/app/api/courses/[id]/syllabus/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, context) {
  try {
    const { id } = await context.params;              // ✅ await dynamic params
    const courseId = Number(id);
    if (!Number.isInteger(courseId) || courseId <= 0) {
      return NextResponse.json({ error: 'Invalid course id' }, { status: 400 });
    }

    // 1) Get modules for this course
    const [moduleRows] = await db.execute(
      `SELECT id, title, summary, position
       FROM modules
       WHERE course_id = ?
       ORDER BY position ASC`,
      [courseId]                                      // ✅ no undefined
    );

    // 2) For each module, fetch lessons & quizzes
    const syllabus = await Promise.all(
      moduleRows.map(async (module) => {
        const [lessons] = await db.execute(
          `SELECT id, title, summary, duration_minutes, position
           FROM lessons
           WHERE module_id = ?
           ORDER BY position ASC`,
          [module.id]
        );

        const [quizzes] = await db.execute(
          `SELECT id, title, summary, duration_minutes, position
           FROM quizzes
           WHERE module_id = ?
           ORDER BY position ASC`,
          [module.id]
        );

        const totalMinutes =
          (lessons || []).reduce((s, l) => s + (l.duration_minutes ?? 0), 0) +
          (quizzes || []).reduce((s, q) => s + (q.duration_minutes ?? 0), 0);

        return {
          ...module,
          lessons,
          quizzes,
          lessonCount: lessons.length,
          quizCount: quizzes.length,
          totalMinutes
        };
      })
    );

    return NextResponse.json(syllabus);
  } catch (error) {
    console.error('Error fetching syllabus:', error);
    return NextResponse.json({ error: 'Failed to fetch syllabus' }, { status: 500 });
  }
}
