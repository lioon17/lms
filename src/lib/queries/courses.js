// src/lib/queries/courses.js
import db from "@/lib/db";

/** Utilities */
export function toBool(v) {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") return ["1", "true", "yes", "on"].includes(v.toLowerCase());
  return false;
}

export async function findCourseById(id) {
  const [rows] = await db.execute(`SELECT * FROM courses WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

 

export async function createCourse(course) {
  const sql = `
    INSERT INTO courses (
      title, summary, cover_image_url, category_id,
      estimated_duration_minutes, price, currency,
      primary_instructor_id, is_published, pass_threshold, created_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `;
  const args = [
    course.title,
    course.summary ?? null,
    course.cover_image_url ?? null,
    course.category_id ?? null,
    course.estimated_duration_minutes ?? null,
    course.price ?? 0.0,
    course.currency ?? "USD",
    course.primary_instructor_id ?? null,
    course.is_published ? 1 : 0,
    course.pass_threshold ?? 70.0,
    course.created_by ?? null,
  ];
  const [res] = await db.execute(sql, args);
  return res.insertId;
}

/** Partial update */
export async function updateCourseById(id, fields) {
  const allowed = [
    
    "title",
    "summary",
    "cover_image_url",
    "category_id",
    "estimated_duration_minutes",
    "price",
    "currency",
    "primary_instructor_id",
    "is_published",
    "pass_threshold",
  ];

  const sets = [];
  const args = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      switch (key) {
        case "is_published":
          args.push(toBool(fields[key]) ? 1 : 0);
          break;
        case "pass_threshold":
          args.push(Number(fields[key]));
          break;
        case "category_id":
        case "primary_instructor_id":
          args.push(fields[key] === null ? null : Number(fields[key]));
          break;
        case "estimated_duration_minutes":
          args.push(fields[key] === null ? null : Number(fields[key]));
          break;
        case "price":
          args.push(Number(fields[key]));
          break;
        default:
          args.push(fields[key] ?? null);
      }
    }
  }

  if (sets.length === 0) return { changed: 0 };

  const sql = `UPDATE courses SET ${sets.join(", ")} WHERE id = ?`;
  args.push(id);
  const [res] = await db.execute(sql, args);
  return { changed: res.affectedRows };
}


export async function getCoursesKPI() {
  // Get total courses count and revenue
  const [kpiRows] = await db.execute(`
    SELECT 
      COUNT(*) as total_courses,
      SUM(price) as total_revenue
    FROM courses
    WHERE is_published = 1
  `);

  // Get detailed course list (optional - remove if not needed)
  const [courseRows] = await db.execute(`
    SELECT
      c.id,
      c.title,
      c.summary,
      c.cover_image_url,
      c.category_id,
      cat.name AS category_name,
      c.estimated_duration_minutes,
      c.price,
      c.currency,
      c.primary_instructor_id,
      c.is_published,
      c.pass_threshold,
      c.created_by,
      u.name AS creator_name,
      u.email AS creator_email
    FROM courses c
    LEFT JOIN users u ON c.created_by = u.id
    LEFT JOIN categories cat ON c.category_id = cat.id
    ORDER BY c.id DESC
  `);

  return {
    kpis: {
      total_courses: kpiRows[0].total_courses,
      total_revenue: kpiRows[0].total_revenue || 0
    },
    courses: courseRows // optional: include if you still need the course list
  };
}
