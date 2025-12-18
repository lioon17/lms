import { NextResponse } from "next/server"
import db from "@/lib/db"

// GET /api/questions/[id]
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const [questions] = await db.execute(
      `SELECT * FROM quiz_questions WHERE id = ?`,
      [id]
    )
    if (questions.length === 0)
      return NextResponse.json({ error: "Question not found" }, { status: 404 })

    const [answers] = await db.execute(
      `SELECT * FROM quiz_answers WHERE question_id = ?`,
      [id]
    )

    return NextResponse.json({ ...questions[0], answers }, { status: 200 })
  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 })
  }
}

// PATCH /api/questions/[id]
export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()

    const { question_text, question_type, points, position } = body

    const updateFields = []
    const updateValues = []

    if (question_text !== undefined) { updateFields.push("question_text = ?"); updateValues.push(question_text) }
    if (question_type !== undefined) { updateFields.push("question_type = ?"); updateValues.push(question_type) }
    if (points !== undefined) { updateFields.push("points = ?"); updateValues.push(points) }
    if (position !== undefined) { updateFields.push("position = ?"); updateValues.push(position) }

    if (updateFields.length === 0)
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })

    updateValues.push(id)

    await db.execute(
      `UPDATE quiz_questions SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    )

    const [updated] = await db.execute(`SELECT * FROM quiz_questions WHERE id = ?`, [id])
    return NextResponse.json(updated[0], { status: 200 })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

// DELETE /api/questions/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const [existing] = await db.execute(`SELECT id FROM quiz_questions WHERE id = ?`, [id])
    if (existing.length === 0)
      return NextResponse.json({ error: "Question not found" }, { status: 404 })

    await db.execute(`DELETE FROM quiz_questions WHERE id = ?`, [id])

    return NextResponse.json({ message: "Question deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
