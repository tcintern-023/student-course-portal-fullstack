/**
 * Custom error class so controllers can throw errors with a specific
 * HTTP status code attached, which the error-handling middleware then reads.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
