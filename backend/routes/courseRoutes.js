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

router.get("/", getAllCourses);
router.get("/:id", validateIdParam, getCourseById);
router.post("/", authenticate, validateCreateCourse, createCourse);
router.put("/:id", authenticate, validateIdParam, validateUpdateCourse, updateCourse);
router.delete("/:id", authenticate, authorize("admin"), validateIdParam, deleteCourse);

module.exports = router;
