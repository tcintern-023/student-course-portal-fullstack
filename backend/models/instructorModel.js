const pool = require("../config/db");

const getAll = async () => {
  const { rows } = await pool.query(
    `SELECT i.id, i.name, i.email, i.bio, i.created_at,
            COUNT(c.id)::int AS course_count,
            COALESCE(
              json_agg(c.title ORDER BY c.title) FILTER (WHERE c.id IS NOT NULL),
              '[]'
            ) AS courses
     FROM instructors i
     LEFT JOIN courses c ON c.instructor_id = i.id
     GROUP BY i.id
     ORDER BY i.id`
  );
  return rows;
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, bio, created_at FROM instructors WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

const getByEmail = async (email) => {
  const { rows } = await pool.query(`SELECT id FROM instructors WHERE email = $1`, [email]);
  return rows[0] || null;
};

const create = async ({ name, email, bio }) => {
  const { rows } = await pool.query(
    `INSERT INTO instructors (name, email, bio) VALUES ($1, $2, $3) RETURNING *`,
    [name, email, bio ?? null]
  );
  return rows[0];
};

const update = async (id, { name, email, bio }) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
  if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }
  if (bio !== undefined) { fields.push(`bio = $${idx++}`); values.push(bio); }

  if (fields.length === 0) return getById(id);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE instructors SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] || null;
};

const remove = async (id) => {
  const { rowCount } = await pool.query(`DELETE FROM instructors WHERE id = $1`, [id]);
  return rowCount > 0;
};

module.exports = { getAll, getById, getByEmail, create, update, remove };
