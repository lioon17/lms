// src/lib/api/base.js
export async function fetchAPI(endpoint, options = {}) {
  // Base URL: env or current origin; ensure it ends with /api
  const rawBase =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const base = rawBase.replace(/\/+$/, "");
  const apiBase = base.endsWith("/api") ? base : `${base}/api`;

  // Endpoint should NOT include /api (Style A). Normalize leading slash.
  const path = String(endpoint || "");
  const url = `${apiBase}${path.startsWith("/") ? path : `/${path}`}`;

  // Merge options; JSON-stringify plain objects automatically
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const opts = { ...options, headers };
  if (opts.body && headers["Content-Type"]?.includes("application/json") && typeof opts.body === "object") {
    opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, opts);

  if (!res.ok) {
    let detail = "";
    try {
      const text = await res.text();
      detail = text ? ` — ${text}` : "";
    } catch {}
    const err = new Error(`API error: ${res.status} @ ${url}${detail}`);
    err.status = res.status;
    throw err;
  }

  // Gracefully handle empty bodies / non-JSON
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!text) return null;
  return ct.includes("application/json") ? JSON.parse(text) : text;
}
