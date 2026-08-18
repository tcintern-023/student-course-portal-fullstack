const express = require("express");
const router = express.Router();

const {
  getAllStudents,
  getStudentById,
  getMyStudentProfile,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const { validateCreateStudent, validateUpdateStudent } = require("../middleware/validateStudent");
const { validateIdParam } = require("../middleware/validateId");
const { authenticate, authorize } = require("../middleware/auth");
const { attachOwnStudent } = require("../middleware/ownership");

// The full student roster is admin-managed data now (see studentController
// for the reasoning) — browsing it isn't public or self-service.
router.get("/", authenticate, authorize("admin"), getAllStudents);
// IMPORTANT: /me must be registered before the /:id param route below, or
// Express (and validateIdParam) will try to parse "me" as a numeric id.
router.get("/me", authenticate, attachOwnStudent, getMyStudentProfile);
router.get("/:id", authenticate, authorize("admin"), validateIdParam, getStudentById);

// Only admins create roster entries directly — a regular user's student
// profile is created automatically on signup (see authController.register).
router.post("/", authenticate, authorize("admin"), validateCreateStudent, createStudent);

// Ownership-based authorization: admins can edit any profile; everyone
// else only their own (enforced in the controller, using req.ownStudentId).
router.put("/:id", authenticate, attachOwnStudent, validateIdParam, validateUpdateStudent, updateStudent);

router.delete("/:id", authenticate, authorize("admin"), validateIdParam, deleteStudent);

module.exports = router;
