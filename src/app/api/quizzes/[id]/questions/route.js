import { NextResponse } from "next/server"
import db from "@/lib/db"

// ✅ GET /api/quizzes/[id]/questions
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const [questions] = await db.execute(
      `
      SELECT 
        q.id, q.quiz_id, q.question_text, q.question_type,
        q.points, q.position, q.created_at
      FROM quiz_questions q
      WHERE q.quiz_id = ?
      ORDER BY q.position ASC
      `,
      [id]
    )

    return NextResponse.json(questions, { status: 200 })
  } catch (error) {
    console.error("Error fetching quiz questions:", error)
    return NextResponse.json({ error: "Failed to fetch quiz questions" }, { status: 500 })
  }
}

// ✅ POST /api/quizzes/[id]/questions
export async function POST(request, { params }) {
  try {
   const { id } = await params
    const body = await request.json()

    const {
      question_text,
      question_type = "multiple_choice",
      points = 1.0,
      position,
      answers = []
    } = body

    if (!question_text || position == null) {
      return NextResponse.json(
        { error: "question_text and position are required" },
        { status: 400 }
      )
    }

    // Ensure quiz exists
    const [quiz] = await db.execute("SELECT id FROM quizzes WHERE id = ?", [id])
    if (quiz.length === 0) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Insert question
    const [result] = await db.execute(
      `
      INSERT INTO quiz_questions (quiz_id, question_text, question_type, points, position)
      VALUES (?, ?, ?, ?, ?)
      `,
      [id, question_text, question_type, Number(points), Number(position)]
    )

    const questionId = result.insertId

    // Insert answers if provided
    if (Array.isArray(answers) && answers.length > 0) {
      const answerValues = answers.map(a => [questionId, a.answer_text, a.is_correct ? 1 : 0])
      await db.query(
        "INSERT INTO quiz_answers (question_id, answer_text, is_correct) VALUES ?",
        [answerValues]
      )
    }

    // Return full question with answers
    const [createdQuestion] = await db.execute(`SELECT * FROM quiz_questions WHERE id = ?`, [questionId])
    const [createdAnswers] = await db.execute(`SELECT * FROM quiz_answers WHERE question_id = ?`, [questionId])

    return NextResponse.json(
      { ...createdQuestion[0], answers: createdAnswers },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating quiz question:", error)
    return NextResponse.json(
      { error: "Failed to create quiz question" },
      { status: 500 }
    )
  }
}
