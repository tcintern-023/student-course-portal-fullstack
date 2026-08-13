const ApiError = require("./ApiError");

const VALID_LEVELS = ["Beginner", "Intermediate", "Advanced"];

const isValidInstructorId = (v) => v === null || (Number.isInteger(v) && v > 0);

/** Validates the request body when creating a course. All fields required except instructorId. */
const validateCreateCourse = (req, res, next) => {
  const { title, category, level, duration, description, topics, instructorId } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || !title.trim()) {
    errors.push("title is required and must be a non-empty string");
  }
  if (!category || typeof category !== "string" || !category.trim()) {
    errors.push("category is required and must be a non-empty string");
  }
  if (!level || !VALID_LEVELS.includes(level)) {
    errors.push(`level is required and must be one of: ${VALID_LEVELS.join(", ")}`);
  }
  if (!duration || typeof duration !== "string" || !duration.trim()) {
    errors.push("duration is required and must be a non-empty string");
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    errors.push("description is required and must be a non-empty string");
  }
  if (
    !Array.isArray(topics) ||
    topics.length === 0 ||
    !topics.every((t) => typeof t === "string" && t.trim())
  ) {
    errors.push("topics is required and must be a non-empty array of strings");
  }
  if (instructorId !== undefined && !isValidInstructorId(instructorId)) {
    errors.push("instructorId must be a positive integer or null");
  }

  if (errors.length > 0) return next(new ApiError(400, errors.join("; ")));
  next();
};

/** Validates the request body when updating a course. Fields are optional, but if present, must be valid. */
const validateUpdateCourse = (req, res, next) => {
  const { title, category, level, duration, description, topics, instructorId } = req.body;
  const errors = [];

  if (Object.keys(req.body).length === 0) {
    errors.push("request body cannot be empty");
  }
  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    errors.push("title must be a non-empty string");
  }
  if (category !== undefined && (typeof category !== "string" || !category.trim())) {
    errors.push("category must be a non-empty string");
  }
  if (level !== undefined && !VALID_LEVELS.includes(level)) {
    errors.push(`level must be one of: ${VALID_LEVELS.join(", ")}`);
  }
  if (duration !== undefined && (typeof duration !== "string" || !duration.trim())) {
    errors.push("duration must be a non-empty string");
  }
  if (description !== undefined && (typeof description !== "string" || !description.trim())) {
    errors.push("description must be a non-empty string");
  }
  if (
    topics !== undefined &&
    (!Array.isArray(topics) ||
      topics.length === 0 ||
      !topics.every((t) => typeof t === "string" && t.trim()))
  ) {
    errors.push("topics must be a non-empty array of strings");
  }
  if (instructorId !== undefined && !isValidInstructorId(instructorId)) {
    errors.push("instructorId must be a positive integer or null");
  }

  if (errors.length > 0) return next(new ApiError(400, errors.join("; ")));
  next();
};

module.exports = { validateCreateCourse, validateUpdateCourse };
