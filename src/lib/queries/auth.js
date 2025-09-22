// lib/queries/auth.js
import db from "../db.js"; // adjust if your db file path differs

export async function createUser({ name, email, password_hash, role }) {
  const query = `
    INSERT INTO users (name, email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;
  const [result] = await db.execute(query, [name, email, password_hash, role]);
  return result.insertId;
}

export async function findUserByEmail(email) {
  const query = `SELECT * FROM users WHERE email = ? LIMIT 1`;
  const [rows] = await db.execute(query, [email]);
  return rows[0] || null;
}
