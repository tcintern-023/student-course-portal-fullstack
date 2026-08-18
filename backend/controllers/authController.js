const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const userModel = require("../models/userModel");
const ApiError = require("../middleware/ApiError");

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

/**
 * @route POST /api/auth/register
 *
 * Authentication vs. authorization: this endpoint only proves who someone
 * is (creates an identity). It deliberately does NOT let the caller choose
 * their own role — accepting a client-supplied `role: "admin"` here would
 * let anyone grant themselves admin permissions, which is an authorization
 * decision and belongs to someone who is already an admin, not to the
 * person signing up. Every public registration becomes a "student" account;
 * promote someone to admin directly in the database (or seed script) if
 * they need elevated access.
 *
 * When the new account is a student, we also create the linked `students`
 * row in the same transaction — that's what ownership-based authorization
 * (see middleware/ownership.js) checks against later, so a student can
 * manage their own profile/enrollments but not anyone else's.
 */
const register = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name, email, password } = req.body;
    const role = "student"; // ignore any role sent by the client — see comment above

    const existing = await userModel.findByEmail(email);
    if (existing) {
      throw new ApiError(400, `An account with email ${email} already exists`);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await client.query("BEGIN");

    const { rows: userRows } = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, role]
    );
    const user = userRows[0];

    // Best-effort: if a `students` row with this email already exists
    // (e.g. an admin pre-registered them on a roster), link it instead of
    // creating a duplicate.
    await client.query(
      `INSERT INTO students (name, email, user_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id`,
      [name, email, user.id]
    );

    await client.query("COMMIT");

    const token = signToken(user);
    res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};

/** @route POST /api/auth/login */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = signToken(user);
    const { password_hash, ...publicUser } = user;

    res.status(200).json({ success: true, data: { user: publicUser, token } });
  } catch (err) {
    next(err);
  }
};

/** @route GET /api/auth/me — requires `authenticate` middleware */
const me = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, me };
