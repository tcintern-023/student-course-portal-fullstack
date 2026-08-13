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

router.get("/", getAllStudents);
router.get("/:id", validateIdParam, getStudentById);
router.post("/", validateCreateStudent, createStudent);
router.put("/:id", validateIdParam, validateUpdateStudent, updateStudent);
router.delete("/:id", validateIdParam, deleteStudent);

module.exports = router;
