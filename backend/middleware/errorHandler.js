// Common PostgreSQL error codes translated into readable, client-safe messages.
// https://www.postgresql.org/docs/current/errcodes-appendix.html
const PG_ERROR_MESSAGES = {
  "23505": "A record with that value already exists (unique constraint violated).",
  "23503": "This operation references a record that doesn't exist (foreign key violated).",
  "23502": "A required field was missing (not-null constraint violated).",
  "22P02": "One of the fields has an invalid format for its type.",
  "23514": "A field value violates a check constraint (e.g. an invalid level).",
};

/**
 * Catches any errors passed via next(err) from anywhere in the app
 * and returns a consistent JSON error response. Must be registered
 * LAST, after all routes.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Raw errors bubbling up from the `pg` driver (not wrapped in ApiError)
  // carry a Postgres error `code` — translate the common ones.
  if (!err.statusCode && err.code && PG_ERROR_MESSAGES[err.code]) {
    statusCode = 400;
    message = PG_ERROR_MESSAGES[err.code];
  }

  console.error(`[Error] ${req.method} ${req.originalUrl} -> ${statusCode}: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

/** Handles requests to routes that don't exist (404). */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

module.exports = { errorHandler, notFoundHandler };
