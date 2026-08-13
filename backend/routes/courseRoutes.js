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

router.get("/", getAllCourses);
router.get("/:id", validateIdParam, getCourseById);
router.post("/", validateCreateCourse, createCourse);
router.put("/:id", validateIdParam, validateUpdateCourse, updateCourse);
router.delete("/:id", validateIdParam, deleteCourse);

module.exports = router;
