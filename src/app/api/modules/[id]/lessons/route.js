import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(_req, context) {
  try {
    const { id } = await context.params       // ✅ await the params
    const moduleId = Number(id)

    if (!Number.isFinite(moduleId) || moduleId <= 0) {
      return NextResponse.json({ error: "Invalid moduleId" }, { status: 400 })
    }

    const [[mod]] = await db.execute(
      `SELECT id, course_id, title, summary, position, created_at, updated_at
       FROM modules WHERE id = ?`,
      [moduleId]
    )
    if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 })

    const [rows] = await db.execute(
      `SELECT id, module_id, title, summary, content, video_url, duration_seconds, position, created_at, updated_at
       FROM lessons
       WHERE module_id = ?
       ORDER BY position ASC, id ASC`,
      [moduleId]
    )

    return NextResponse.json({
      module: {
        id: mod.id,
        courseId: mod.course_id,
        title: mod.title,
        summary: mod.summary,
        position: mod.position,
        createdAt: mod.created_at,
        updatedAt: mod.updated_at,
      },
      lessons: rows.map(r => ({
        id: r.id,
        moduleId: r.module_id,
        title: r.title,
        summary: r.summary,
        content: r.content,
        videoUrl: r.video_url,
        durationSeconds: r.duration_seconds,
        position: r.position,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    })
  } catch (err) {
    console.error("GET /modules/[id]/lessons error:", err)
    return NextResponse.json({ error: "Failed to load module lessons" }, { status: 500 })
  }
}
