import { fetchAPI } from "@/lib/api/base"
export async function listCourses() {
  return fetchAPI("/courses", { method: "GET", cache: "no-store" })
}

export async function createCourse(data) {
  const response = await fetch("/api/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  const result = await response.json()
  if (!response.ok) throw new Error(result.error || "Failed to create course")

  return result
}


function normalizeCourse(row) {
  if (!row) return null
  return {
    id: Number(row.id),
    title: row.title ?? "Untitled Course",
    summary: row.summary ?? "",
    cover_image_url: row.cover_image_url || "",
    category_id: row.category_id == null ? null : Number(row.category_id),
    category_name: row.category_name ?? null,
    estimated_duration_minutes:
      row.estimated_duration_minutes == null
        ? null
        : Number(row.estimated_duration_minutes),
    // server returns "70.00" (string) — keep both raw and numeric
    price: row.price == null ? null : Number(row.price),
    price_raw: row.price, // if you ever need the exact string
    currency: (row.currency || "USD").toUpperCase(),
    primary_instructor_id:
      row.primary_instructor_id == null ? null : Number(row.primary_instructor_id),
    is_published: !!row.is_published, // 0/1 -> boolean
    pass_threshold:
      row.pass_threshold == null ? null : Number(row.pass_threshold),
    created_by: row.created_by == null ? null : Number(row.created_by),
    creator_name: row.creator_name ?? null,
    creator_email: row.creator_email ?? null,
  }
}

/**
 * Get a single course by id.
 * Throws on non-OK or 404 to simplify caller logic.
 */
export async function getCourse(courseId) {
  if (!courseId) throw new Error("courseId is required")
  const res = await fetchAPI(`/courses/${courseId}`, { method: "GET", cache: "no-store" })
  // Your route returns a single row object (not {data: ...})
  // so res is already the row; normalize it.
  if (!res || res.error) {
    // When the API returns { error: "Course not found" } with 404,
    // fetchAPI may pass that through as res.error — bubble it up:
    throw new Error(res?.error || "Failed to fetch course")
  }
  return normalizeCourse(res)
}

export async function updateCourse(id, data) {
  const response = await fetch(`/api/courses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json = await response.json()
  if (!response.ok) throw new Error(json?.error || "Failed to update course")
  return json
}