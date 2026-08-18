const pool = require("../config/db");

const slugify = (title) =>
  title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Ensures a slug is unique by appending -2, -3, etc. if needed. */
const uniqueSlug = async (baseSlug, ignoreId = null) => {
  let candidate = baseSlug;
  let suffix = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { rows } = await pool.query(
      `SELECT id FROM courses WHERE slug = $1 AND ($2::int IS NULL OR id != $2)`,
      [candidate, ignoreId]
    );
    if (rows.length === 0) return candidate;
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

const COURSE_SELECT = `
  SELECT c.id, c.slug, c.title, c.category, c.level, c.duration, c.description, c.topics,
         c.instructor_id, c.created_at,
         i.name AS instructor_name
  FROM courses c
  LEFT JOIN instructors i ON c.instructor_id = i.id
`;

/**
 * Get courses with optional search, category/level filters, and pagination.
 * Returns { data, total, page, limit } so the frontend can render pagination controls.
 */
const getAll = async ({ search, category, level, page = 1, limit = 20 } = {}) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (search) {
    conditions.push(
      `(c.title ILIKE $${idx} OR c.description ILIKE $${idx} OR i.name ILIKE $${idx})`
    );
    values.push(`%${search}%`);
    idx += 1;
  }
  if (category) {
    conditions.push(`c.category ILIKE $${idx}`);
    values.push(category);
    idx += 1;
  }
  if (level) {
    conditions.push(`c.level = $${idx}`);
    values.push(level);
    idx += 1;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const offset = (safePage - 1) * safeLimit;

  const countQuery = `
    SELECT COUNT(*) FROM courses c
    LEFT JOIN instructors i ON c.instructor_id = i.id
    ${where}
  `;
  const dataQuery = `
    ${COURSE_SELECT}
    ${where}
    ORDER BY c.id
    LIMIT $${idx} OFFSET $${idx + 1}
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, values),
    pool.query(dataQuery, [...values, safeLimit, offset]),
  ]);

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
    page: safePage,
    limit: safeLimit,
  };
};

const getById = async (id) => {
  const { rows } = await pool.query(`${COURSE_SELECT} WHERE c.id = $1`, [id]);
  return rows[0] || null;
};

const getBySlug = async (slug) => {
  const { rows } = await pool.query(`${COURSE_SELECT} WHERE c.slug = $1`, [slug]);
  return rows[0] || null;
};

const create = async (data) => {
  const slug = await uniqueSlug(slugify(data.title));
  const { rows } = await pool.query(
    `INSERT INTO courses (slug, title, category, level, duration, description, topics, instructor_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      slug,
      data.title,
      data.category,
      data.level,
      data.duration,
      data.description,
      data.topics,
      data.instructorId ?? null,
    ]
  );
  return getById(rows[0].id);
};

const update = async (id, data) => {
  const existing = await getById(id);
  if (!existing) return null;

  const fields = [];
  const values = [];
  let idx = 1;

  if (data.title !== undefined) {
    const slug = await uniqueSlug(slugify(data.title), id);
    fields.push(`title = $${idx++}`);
    values.push(data.title);
    fields.push(`slug = $${idx++}`);
    values.push(slug);
  }
  if (data.category !== undefined) { fields.push(`category = $${idx++}`); values.push(data.category); }
  if (data.level !== undefined) { fields.push(`level = $${idx++}`); values.push(data.level); }
  if (data.duration !== undefined) { fields.push(`duration = $${idx++}`); values.push(data.duration); }
  if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
  if (data.topics !== undefined) { fields.push(`topics = $${idx++}`); values.push(data.topics); }
  if (data.instructorId !== undefined) { fields.push(`instructor_id = $${idx++}`); values.push(data.instructorId); }

  if (fields.length === 0) return existing;

  values.push(id);
  await pool.query(`UPDATE courses SET ${fields.join(", ")} WHERE id = $${idx}`, values);
  return getById(id);
};

const remove = async (id) => {
  const { rowCount } = await pool.query(`DELETE FROM courses WHERE id = $1`, [id]);
  return rowCount > 0;
};

module.exports = { getAll, getById, getBySlug, create, update, remove };
