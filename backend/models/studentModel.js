const pool = require("../config/db");

const getAll = async () => {
  const { rows } = await pool.query(
    `SELECT id, name, email, created_at FROM students ORDER BY id`
  );
  return rows;
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, created_at FROM students WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
};

const create = async ({ name, email }) => {
  const { rows } = await pool.query(
    `INSERT INTO students (name, email) VALUES ($1, $2) RETURNING *`,
    [name, email]
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
    `UPDATE students SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] || null;
};

const remove = async (id) => {
  const { rowCount } = await pool.query(`DELETE FROM students WHERE id = $1`, [id]);
  return rowCount > 0;
};

module.exports = { getAll, getById, create, update, remove };
