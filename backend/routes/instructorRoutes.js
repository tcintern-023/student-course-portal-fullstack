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
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", getAllInstructors);
router.get("/:id", validateIdParam, getInstructorById);
router.post("/", authenticate, validateCreateInstructor, createInstructor);
router.put("/:id", authenticate, validateIdParam, validateUpdateInstructor, updateInstructor);
router.delete("/:id", authenticate, authorize("admin"), validateIdParam, deleteInstructor);

module.exports = router;
