// src/lib/queries/categories.js
import db from "@/lib/db";

export async function findCategoryById(id) {
  const [rows] = await db.execute(`SELECT * FROM categories WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

export async function findCategoryBySlug(slug) {
  const [rows] = await db.execute(`SELECT * FROM categories WHERE slug = ? LIMIT 1`, [slug]);
  return rows[0] || null;
}

export async function findCategoryByName(name) {
  const [rows] = await db.execute(`SELECT * FROM categories WHERE name = ? LIMIT 1`, [name]);
  return rows[0] || null;
}

export async function listCategories() {
  const [rows] = await db.execute(`SELECT * FROM categories ORDER BY name ASC`);
  return rows;
}

export async function createCategory({ name, slug }) {
  const sql = `INSERT INTO categories (name, slug) VALUES (?, ?)`;
  const [res] = await db.execute(sql, [name, slug]);
  return res.insertId;
}

export async function updateCategoryById(id, fields) {
  const allowed = ["name", "slug"];
  const sets = [];
  const args = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      args.push(fields[key]);
    }
  }

  if (sets.length === 0) return { changed: 0 };

  const sql = `UPDATE categories SET ${sets.join(", ")} WHERE id = ?`;
  args.push(id);
  const [res] = await db.execute(sql, args);
  return { changed: res.affectedRows };
}

export async function deleteCategoryById(id) {
  const [res] = await db.execute(`DELETE FROM categories WHERE id = ?`, [id]);
  return { deleted: res.affectedRows };
}
