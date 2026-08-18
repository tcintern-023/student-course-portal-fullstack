const express = require("express");
const router = express.Router();

const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

const { validateCreateCourse, validateUpdateCourse } = require("../middleware/validateCourse");
const { validateIdParam } = require("../middleware/validateId");
const { authenticate, authorize } = require("../middleware/auth");

// Courses are catalog content, not something an individual user "owns" —
// so RBAC (role check) is the right tool here, not ownership. Only admins
// may create/update/delete; browsing stays public.
router.get("/", getAllCourses);
router.get("/:id", validateIdParam, getCourseById);
router.post("/", authenticate, authorize("admin"), validateCreateCourse, createCourse);
router.put("/:id", authenticate, authorize("admin"), validateIdParam, validateUpdateCourse, updateCourse);
router.delete("/:id", authenticate, authorize("admin"), validateIdParam, deleteCourse);

module.exports = router;
