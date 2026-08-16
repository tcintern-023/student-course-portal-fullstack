const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const ApiError = require("../middleware/ApiError");

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

/** @route POST /api/auth/register */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      throw new ApiError(400, `An account with email ${email} already exists`);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userModel.create({ name, email, passwordHash, role });
    const token = signToken(user);

    res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
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
