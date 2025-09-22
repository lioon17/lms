"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import {CourseBuilderWithSidebar} from "@/components/course-builder/course-builder-with-sidebar"
import { getCourse } from "@/lib/api/courses"
import { listCategories } from "@/lib/api/categories"
import { listInstructors } from "@/lib/api/instructors"

export default function CourseBuilderPage() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [course, setCourse] = useState(null)
  const [categories, setCategories] = useState([])
  const [instructors, setInstructors] = useState([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        // fetch dropdown data (optional but handy)
        const [cats, instrs] = await Promise.all([
         listCategories().catch(() => []),
         listInstructors().catch(() => []),
       ])
        if (!alive) return
        setCategories(Array.isArray(cats?.data) ? cats.data : Array.isArray(cats) ? cats : [])
         // listInstructors() already returns an ARRAY (json.data || []), so this works for both shapes:
        setInstructors(
          Array.isArray(instrs?.data) ? instrs.data : (Array.isArray(instrs) ? instrs : [])
        )

        if (courseId) {
          const row = await getCourse(courseId)
          if (!alive) return
          setCourse({
            id: row.id,
            title: row.title || "",
            summary: row.summary || "",
            description: row.description || "",
            longDescription: row.long_description || "",
            category: row.category_name || "",
            level: row.level || "beginner",
            estimatedHours: Math.round((Number(row.estimated_duration_minutes) || 0) / 60),
            price: Number(row.price || 0),
            passThreshold: Number(row.pass_threshold || 70),
            instructorId: row.primary_instructor_id ? String(row.primary_instructor_id) : "",
            instructorName: row.creator_name || "",
            coverImage: row.cover_image_url || "",
            visibility: row.is_published ? "published" : "draft",
            tags: Array.isArray(row.tags) ? row.tags : [],
            modules: [], // other sections fetch their own details as needed
          })
        } else {
          // brand-new course shell
          setCourse({
            id: Date.now(),
            title: "",
            summary: "",
            description: "",
            longDescription: "",
            category: "",
            level: "beginner",
            estimatedHours: 0,
            price: 0,
            passThreshold: 70,
            instructorId: "",
            instructorName: "",
            coverImage: "",
            visibility: "draft",
            tags: [],
            modules: [],
          })
        }
      } catch (e) {
        if (!alive) return
        setError(e.message || "Failed to load course")
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [courseId])

  if (loading) return <div className="p-6">Loading course builder…</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>
  if (!course) return <div className="p-6">No course found.</div>

  return (
    <CourseBuilderWithSidebar
      course={course}
      instructors={instructors}
      categories={categories}
      defaultTab="basics"   // ⬅️ show Basics first
      backTo="/dashboard"
    />
  )
}
