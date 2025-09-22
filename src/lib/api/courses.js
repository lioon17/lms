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


export async function getCourse(courseId) {
  const res = await fetchAPI(`/courses/${courseId}`, { method: "GET", cache: "no-store" })
  return res?.data ?? res
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