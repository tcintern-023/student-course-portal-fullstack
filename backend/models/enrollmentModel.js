const pool = require("../config/db");

const ENROLLMENT_SELECT = `
  SELECT e.id, e.student_id, e.course_id, e.enrolled_at,
         s.name AS student_name, s.email AS student_email,
         c.title AS course_title, c.slug AS course_slug
  FROM enrollments e
  JOIN students s ON e.student_id = s.id
  JOIN courses c ON e.course_id = c.id
`;

const getAll = async ({ studentId, courseId } = {}) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (studentId) { conditions.push(`e.student_id = $${idx++}`); values.push(studentId); }
  if (courseId) { conditions.push(`e.course_id = $${idx++}`); values.push(courseId); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(`${ENROLLMENT_SELECT} ${where} ORDER BY e.id`, values);
  return rows;
};

const getById = async (id) => {
  const { rows } = await pool.query(`${ENROLLMENT_SELECT} WHERE e.id = $1`, [id]);
  return rows[0] || null;
};

/** Returns null if the student is already enrolled in the course (unique constraint). */
const create = async ({ studentId, courseId }) => {
  try {
    const { rows } = await pool.query(
      `INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING id`,
      [studentId, courseId]
    );
    return getById(rows[0].id);
  } catch (err) {
    if (err.code === "23505") return null; // unique_violation — already enrolled
    throw err;
  }
};

const remove = async (id) => {
  const { rowCount } = await pool.query(`DELETE FROM enrollments WHERE id = $1`, [id]);
  return rowCount > 0;
};

module.exports = { getAll, getById, create, remove };
