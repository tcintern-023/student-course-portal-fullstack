const pool = require("../config/db");

/** Public-safe fields only — never return password_hash to the client. */
const PUBLIC_COLUMNS = "id, name, email, role, created_at";

const findByEmail = async (email) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1`,
    [email]
  );
  return rows[0] ?? null;
};

const findById = async (id) => {
  const { rows } = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
};

const create = async ({ name, email, passwordHash, role }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_COLUMNS}`,
    [name, email, passwordHash, role || "student"]
  );
  return rows[0];
};

module.exports = { findByEmail, findById, create };
