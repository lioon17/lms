import { NextResponse } from "next/server"
import db from "@/lib/db"

// GET /api/questions/[id]/answers
export async function GET(request, { params }) {
  try {
    const { id } = await params
    const [answers] = await db.execute(
      `SELECT * FROM quiz_answers WHERE question_id = ?`,
      [id]
    )
    return NextResponse.json(answers, { status: 200 })
  } catch (error) {
    console.error("Error fetching answers:", error)
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 })
  }
}

// POST /api/questions/[id]/answers
export async function POST(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    const { answer_text, is_correct = 0 } = body

    if (!answer_text)
      return NextResponse.json({ error: "answer_text is required" }, { status: 400 })

    const [question] = await db.execute("SELECT id FROM quiz_questions WHERE id = ?", [id])
    if (question.length === 0)
      return NextResponse.json({ error: "Question not found" }, { status: 404 })

    const [result] = await db.execute(
      `INSERT INTO quiz_answers (question_id, answer_text, is_correct) VALUES (?, ?, ?)`,
      [id, answer_text, is_correct ? 1 : 0]
    )

    const [newAnswer] = await db.execute(
      `SELECT * FROM quiz_answers WHERE id = ?`,
      [result.insertId]
    )

    return NextResponse.json(newAnswer[0], { status: 201 })
  } catch (error) {
    console.error("Error creating answer:", error)
    return NextResponse.json({ error: "Failed to create answer" }, { status: 500 })
  }
}
