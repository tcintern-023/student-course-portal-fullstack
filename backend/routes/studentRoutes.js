const express = require("express");
const router = express.Router();

const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const { validateCreateStudent, validateUpdateStudent } = require("../middleware/validateStudent");
const { validateIdParam } = require("../middleware/validateId");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", getAllStudents);
router.get("/:id", validateIdParam, getStudentById);
router.post("/", authenticate, validateCreateStudent, createStudent);
router.put("/:id", authenticate, validateIdParam, validateUpdateStudent, updateStudent);
router.delete("/:id", authenticate, authorize("admin"), validateIdParam, deleteStudent);

module.exports = router;
