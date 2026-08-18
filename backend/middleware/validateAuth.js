const ApiError = require("./ApiError");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Note: `role` is intentionally NOT accepted here. Registration always
// creates a "student" account (see authController.register) — letting a
// client choose their own role would be a privilege-escalation bug, not a
// feature. Admins are provisioned directly (see scripts/seed.js), never
// through public signup.
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
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
