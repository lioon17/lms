export async function listInstructors({ q = "", page = 1, limit = 50 } = {}) {
  const res = await fetch(`/api/instructors?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`, { cache: "no-store" })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Failed to load instructors")
  return json.data || []
}
