const express = require("express");
const router = express.Router();

const {
  getAllInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor,
} = require("../controllers/instructorController");

const { validateCreateInstructor, validateUpdateInstructor } = require("../middleware/validateInstructor");
const { validateIdParam } = require("../middleware/validateId");

router.get("/", getAllInstructors);
router.get("/:id", validateIdParam, getInstructorById);
router.post("/", validateCreateInstructor, createInstructor);
router.put("/:id", validateIdParam, validateUpdateInstructor, updateInstructor);
router.delete("/:id", validateIdParam, deleteInstructor);

module.exports = router;
