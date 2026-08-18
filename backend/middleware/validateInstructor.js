const ApiError = require("./ApiError");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateCreateInstructor = (req, res, next) => {
  const { name, email, bio } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("name is required and must be a non-empty string");
  }
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    errors.push("email is required and must be a valid email address");
  }
  if (bio !== undefined && typeof bio !== "string") {
    errors.push("bio must be a string");
  }

  if (errors.length > 0) return next(new ApiError(400, errors.join("; ")));
  next();
};

const validateUpdateInstructor = (req, res, next) => {
  const { name, email, bio } = req.body;
  const errors = [];

  if (Object.keys(req.body).length === 0) errors.push("request body cannot be empty");
  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    errors.push("name must be a non-empty string");
  }
  if (email !== undefined && (typeof email !== "string" || !EMAIL_RE.test(email))) {
    errors.push("email must be a valid email address");
  }
  if (bio !== undefined && typeof bio !== "string") {
    errors.push("bio must be a string");
  }

  if (errors.length > 0) return next(new ApiError(400, errors.join("; ")));
  next();
};

module.exports = { validateCreateInstructor, validateUpdateInstructor };
