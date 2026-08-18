const pool = require("../config/db");

const PUBLIC_COLUMNS = "id, name, email, user_id, created_at";

const getAll = async () => {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM students ORDER BY id`
  );
  return rows;
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM students WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

/** Looks up the student profile linked to a given user account, if any. */
const findByUserId = async (userId) => {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM students WHERE user_id = $1`,
    [userId]
  );
  return rows[0] || null;
};

const create = async ({ name, email, userId = null }) => {
  const { rows } = await pool.query(
    `INSERT INTO students (name, email, user_id) VALUES ($1, $2, $3) RETURNING ${PUBLIC_COLUMNS}`,
    [name, email, userId]
  );
  return rows[0];
};

const update = async (id, { name, email }) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
  if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }

  if (fields.length === 0) return getById(id);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE students SET ${fields.join(", ")} WHERE id = $${idx} RETURNING ${PUBLIC_COLUMNS}`,
    values
  );
  return rows[0] || null;
};

const remove = async (id) => {
  const { rowCount } = await pool.query(`DELETE FROM students WHERE id = $1`, [id]);
  return rowCount > 0;
};

module.exports = { getAll, getById, findByUserId, create, update, remove };
