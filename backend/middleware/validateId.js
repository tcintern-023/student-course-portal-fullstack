const ApiError = require("./ApiError");

/** Validates that :id route params are valid positive integers. */
const validateIdParam = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(new ApiError(400, "id must be a positive integer"));
  }
  req.params.id = id;
  next();
};

module.exports = { validateIdParam };
