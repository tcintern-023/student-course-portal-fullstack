const jwt = require("jsonwebtoken");
const ApiError = require("./ApiError");

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET in environment. Check your .env file.");
  process.exit(1);
}

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches the
 * decoded payload to req.user. Rejects with 401 if the header is missing,
 * malformed, expired, or the token was signed with a different secret.
 */
const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication required. Include an Authorization: Bearer <token> header."));
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Your session has expired. Please log in again."));
    }
    return next(new ApiError(401, "Invalid authentication token."));
  }
};

/**
 * Restricts a route to specific roles. Must run after `authenticate`.
 * Usage: router.delete("/:id", authenticate, authorize("admin"), handler)
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required."));
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, "You don't have permission to perform this action."));
  }
  next();
};

module.exports = { authenticate, authorize };
