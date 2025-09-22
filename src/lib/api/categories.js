export async function listCategories() {
  const res = await fetch("/api/categories", { cache: "no-store" })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || "Failed to load categories")
  return json || []
}
