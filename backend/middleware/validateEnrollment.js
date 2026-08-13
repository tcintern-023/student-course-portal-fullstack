const ApiError = require("./ApiError");

const isPositiveInt = (v) => Number.isInteger(v) && v > 0;

const validateCreateEnrollment = (req, res, next) => {
  const { studentId, courseId } = req.body;
  const errors = [];

  if (!isPositiveInt(studentId)) errors.push("studentId is required and must be a positive integer");
  if (!isPositiveInt(courseId)) errors.push("courseId is required and must be a positive integer");

  if (errors.length > 0) return next(new ApiError(400, errors.join("; ")));
  next();
};

module.exports = { validateCreateEnrollment };
