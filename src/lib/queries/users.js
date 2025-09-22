// src/lib/queries/users.js
import db from "@/lib/db";

/**
 * List instructors with optional search & pagination
 * @param {object} opts
 * @param {string|null} opts.q       - search term (matches name/email)
 * @param {number}      opts.limit   - page size
 * @param {number}      opts.offset  - offset for pagination
 */
export async function listInstructors({ q = null, limit = 50, offset = 0 } = {}) {
  const args = [];
  let where = `WHERE role = 'instructor'`;

  if (q && q.trim()) {
    where += ` AND (name LIKE ? OR email LIKE ?)`;
    const like = `%${q.trim()}%`;
    args.push(like, like);
  }

  const sql = `
    SELECT id, name, email, role, created_at
    FROM users
    ${where}
    ORDER BY name ASC
    LIMIT ? OFFSET ?
  `;
  args.push(Number(limit), Number(offset));

  const [rows] = await db.execute(sql, args);
  return rows;
}

/** Optional: total count for pagination */
export async function countInstructors({ q = null } = {}) {
  const args = [];
  let where = `WHERE role = 'instructor'`;

  if (q && q.trim()) {
    where += ` AND (name LIKE ? OR email LIKE ?)`;
    const like = `%${q.trim()}%`;
    args.push(like, like);
  }

  const [rows] = await db.execute(`SELECT COUNT(*) AS total FROM users ${where}`, args);
  return rows[0]?.total || 0;
}
