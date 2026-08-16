const ApiError = require("./ApiError");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ["student", "admin"];

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("name is required and must be a non-empty string");
  }
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    errors.push("email is required and must be a valid email address");
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    errors.push("password is required and must be at least 6 characters");
  }
  if (role !== undefined && !VALID_ROLES.includes(role)) {
    errors.push(`role must be one of: ${VALID_ROLES.join(", ")}`);
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join("; ")));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    errors.push("email is required and must be a valid email address");
  }
  if (!password || typeof password !== "string") {
    errors.push("password is required");
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join("; ")));
  }

  next();
};

module.exports = { validateRegister, validateLogin };
