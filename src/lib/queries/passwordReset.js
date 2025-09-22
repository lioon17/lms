import db from "../db"; // your pool
import bcrypt from "bcryptjs";

export async function createPasswordReset(email, otpPlain, expiresAt) {
  const otp_hash = await bcrypt.hash(otpPlain, 10);
  // Optional: clear previous pending resets for this email
  await db.execute(`DELETE FROM password_resets WHERE email = ?`, [email]);

  await db.execute(
    `INSERT INTO password_resets (email, otp_hash, expires_at) VALUES (?, ?, ?)`,
    [email, otp_hash, expiresAt]
  );
  return true;
}

export async function getLatestResetForEmail(email) {
  const [rows] = await db.execute(
    `SELECT * FROM password_resets WHERE email = ? ORDER BY created_at DESC LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

export async function deletePasswordResets(email) {
  await db.execute(`DELETE FROM password_resets WHERE email = ?`, [email]);
}

export async function updateUserPasswordByEmail(email, password_hash) {
  const [res] = await db.execute(
    `UPDATE users SET password_hash = ? WHERE email = ?`,
    [password_hash, email]
  );
  return res.affectedRows > 0;
}
