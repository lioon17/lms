export async function fetcher(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // ✅ This is the critical part
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || res.statusText)
  }

  return res.json()
}
