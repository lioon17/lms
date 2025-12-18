import { NextResponse } from "next/server"
import db from "@/lib/db"

// PATCH /api/answers/[id]
export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { answer_text, is_correct } = body

    const updateFields = []
    const updateValues = []

    if (answer_text !== undefined) { updateFields.push("answer_text = ?"); updateValues.push(answer_text) }
    if (is_correct !== undefined) { updateFields.push("is_correct = ?"); updateValues.push(is_correct ? 1 : 0) }

    if (updateFields.length === 0)
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })

    updateValues.push(id)

    await db.execute(
      `UPDATE quiz_answers SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    )

    const [updated] = await db.execute(`SELECT * FROM quiz_answers WHERE id = ?`, [id])
    return NextResponse.json(updated[0], { status: 200 })
  } catch (error) {
    console.error("Error updating answer:", error)
    return NextResponse.json({ error: "Failed to update answer" }, { status: 500 })
  }
}

// DELETE /api/answers/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const [exists] = await db.execute(`SELECT id FROM quiz_answers WHERE id = ?`, [id])
    if (exists.length === 0)
      return NextResponse.json({ error: "Answer not found" }, { status: 404 })

    await db.execute(`DELETE FROM quiz_answers WHERE id = ?`, [id])

    return NextResponse.json({ message: "Answer deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting answer:", error)
    return NextResponse.json({ error: "Failed to delete answer" }, { status: 500 })
  }
}
